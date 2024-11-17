from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum


class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return str(self.name)


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ("income", "Income"),
        ("expense", "Expense"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200, null=True, blank=True)
    transaction_type = models.CharField(
        max_length=7, choices=TRANSACTION_TYPES, default="expense"
    )

    def __str__(self):
        return f"{self.date} - {self.category} - {self.amount}"


class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.category.name} - {self.amount}"

    def get_progress(self):
        actual_spending = Transaction.objects.filter(
            user=self.user,
            category=self.category,
            transaction_type='expense',
            date__range=[self.start_date, self.end_date]
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        return (actual_spending / self.amount) * 100 if self.amount > 0 else 0