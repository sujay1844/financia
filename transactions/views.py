from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum
from .models import Transaction, Category, Budget
from .forms import TransactionForm, BudgetForm
from django.utils import timezone


@login_required
def dashboard(request):
    today = timezone.now()

    # Get monthly income and expenses
    monthly_income = (
        Transaction.objects.filter(
            user=request.user, transaction_type="income", date__month=today.month
        ).aggregate(Sum("amount"))["amount__sum"]
        or 0
    )

    monthly_expenses = (
        Transaction.objects.filter(
            user=request.user, transaction_type="expense", date__month=today.month
        ).aggregate(Sum("amount"))["amount__sum"]
        or 0
    )

    # get budget_data
    budgets = Budget.objects.filter(user=request.user)
    budget_data = []
    for budget in budgets:
        current_spending = Transaction.objects.filter(
            user=request.user,
            category=budget.category,
            transaction_type="expense",
            date__range=[budget.start_date, today],
        ).aggregate(Sum("amount"))["amount__sum"] or 0
        budget_data.append({
            "category": budget.category.name,
            "amount": budget.amount,
            "actual_spending": current_spending,
            "progress": budget.get_progress(),
        })

    context = {
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "net": monthly_income - monthly_expenses,
        "budget_data": budget_data,
        "recent_transactions": Transaction.objects.filter(user=request.user).order_by(
            "-date"
        )[:5],
    }

    return render(request, "transactions/dashboard.html", context)


@login_required
def add_transaction(request):
    if request.method == "POST":
        form = TransactionForm(request.POST)
        if form.is_valid():
            transaction = form.save(commit=False)
            transaction.user = request.user
            transaction.save()
            messages.success(request, "Transaction added successfully!")
            return redirect("dashboard")
        else:
            messages.error(request, f"Error in form submission: {form.errors}")
    else:
        form = TransactionForm()

    categories = Category.objects.filter(user=request.user)
    return render(request, "transactions/transaction_form.html", {
        "form": form,
        "categories": categories
    })


@login_required
def transaction_list(request):
    transactions = Transaction.objects.filter(user=request.user).order_by("-date")
    return render(
        request, "transactions/transaction_list.html", {"transactions": transactions}
    )


@login_required
def budget_list(request):
    budgets = Budget.objects.filter(user=request.user)
    categories = Category.objects.filter(user=request.user)
    return render(request, "transactions/budget_list.html", {
        "budgets": budgets,
        "categories": categories
    })


@login_required
def delete_transaction(request, transaction_id):
    try:
        transaction = Transaction.objects.get(id=transaction_id, user=request.user)
        transaction.delete()
        messages.success(request, "Transaction deleted successfully!")
    except Transaction.DoesNotExist:
        messages.error(request, "Transaction not found!")
    
    return redirect('transaction_list')


@login_required
def add_budget(request):
    if request.method == "POST":
        form = BudgetForm(request.POST)
        if form.is_valid():
            budget = form.save(commit=False)
            budget.user = request.user
            budget.save()
            messages.success(request, "Budget added successfully!")
            return redirect('budget_list')
        else:
            messages.error(request, "Error adding budget. Please check your inputs.")
    return redirect('budget_list')
