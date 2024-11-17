from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("add/", views.add_transaction, name="add_transaction"),
    path("list/", views.transaction_list, name="transaction_list"),
    path("budgets/", views.budget_list, name="budget_list"),
    path("delete/<int:transaction_id>/", views.delete_transaction, name="delete_transaction"),
    path('budgets/add/', views.add_budget, name='add_budget'),
]
