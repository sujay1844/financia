from django import forms
from .models import Transaction, Budget


class TransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = ["date", "category", "amount", "description", "transaction_type"]
        widgets = {
            "date": forms.DateInput(attrs={"type": "date"}),
            "transaction_type": forms.Select(choices=Transaction.TRANSACTION_TYPES)
        }


class BudgetForm(forms.ModelForm):
    class Meta:
        model = Budget
        fields = ["category", "amount", "start_date", "end_date"]
        widgets = {
            "start_date": forms.DateInput(attrs={"type": "date"}),
            "end_date": forms.DateInput(attrs={"type": "date"}),
        }
