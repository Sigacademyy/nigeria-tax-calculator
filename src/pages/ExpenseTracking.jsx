import { useState, useEffect } from "react";
import "../styles/ui.css";
import { getUserStorageKey } from "../utils/storage";
import { useToast } from "../context/ToastContext";
import CopyButton from "../components/CopyButton";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import SimpleChart from "../components/SimpleChart";

const EXPENSE_CATEGORIES = [
  "Rent - Business Premises",
  "Utilities - Business",
  "Office Supplies",
  "Marketing & Advertising",
  "Professional Fees",
  "Employee Salaries",
  "Staff Welfare",
  "Shipping & Delivery",
  "Business Insurance",
  "Licenses & Permits",
  "Business Subscriptions",
  "Bank Charges",
  "Travel Expenses",
  "Entertainment",
  "Vehicle Expenses",
  "Home Office",
  "Depreciation",
  "Training & Development",
  "Personal Expenses",
  "Owner Drawings",
  "Income Taxes",
  "Fines & Penalties",
  "Political Contributions",
  "Dividends",
];

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Cheque", "Card", "Mobile Money"];

const VAT_RATE = 0.075; // 7.5%

// Default deductible percentages by category (Nigeria Tax Act)
const getDefaultDeductible = (category) => {
  const nonDeductible = ["Personal Expenses", "Owner Drawings", "Fines & Penalties", "Political Contributions", "Dividends"];
  if (nonDeductible.includes(category)) return 0;
  if (category === "Entertainment") return 50; // 50% deductible
  if (category === "Home Office") return 50; // 50% deductible
  return 100; // Most business expenses are 100% deductible
};

const STORAGE_KEY_EXPENSES_BASE = "expense_tracking_data_v1";
const STORAGE_KEY_LLC_BASE = "llc_tax_data_ui_v1";

export default function ExpenseTracking() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([
    {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0], // Default to today's date in YYYY-MM-DD format
      vendor: "",
      category: "Staff Welfare",
      description: "",
      amount: "",
      isVATable: true, // New field for VAT/VAT-free
      vat: "",
      amountAfterVat: "",
      paymentMethod: "",
      deductiblePercent: "100.00",
      taxDeductionAmount: "",
      notes: "",
    },
  ]);

  // Load employees from LLC page
  const [employees, setEmployees] = useState([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Auto-save indicator
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const loadEmployees = () => {
    const STORAGE_KEY_LLC = getUserStorageKey(STORAGE_KEY_LLC_BASE);
    const llcData = localStorage.getItem(STORAGE_KEY_LLC);
    if (llcData) {
      try {
        const data = JSON.parse(llcData);
        if (data.employees && Array.isArray(data.employees)) {
          setEmployees(data.employees.filter(emp => emp.name && emp.name.trim() !== ""));
        }
      } catch (e) {
        console.error("Error loading employees:", e);
      }
    }
  };

  useEffect(() => {
    // Load employees from LLC storage
    loadEmployees();

    // Load saved expenses
    const STORAGE_KEY_EXPENSES = getUserStorageKey(STORAGE_KEY_EXPENSES_BASE);
    const savedExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (savedExpenses) {
      try {
        const parsed = JSON.parse(savedExpenses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExpenses(parsed);
        }
      } catch (e) {
        console.error("Error loading expenses:", e);
      }
    }

    // Listen for storage changes to refresh employees when updated in LLC page
    const handleStorageChange = (e) => {
      const STORAGE_KEY_LLC = getUserStorageKey(STORAGE_KEY_LLC_BASE);
      if (e.key === STORAGE_KEY_LLC) {
        loadEmployees();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Save expenses to localStorage with auto-save indicator
  useEffect(() => {
    if (expenses.length > 0) {
      setIsSaving(true);
      const STORAGE_KEY_EXPENSES = getUserStorageKey(STORAGE_KEY_EXPENSES_BASE);
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
      
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 500);
    }
  }, [expenses]);

  // Sync total expenses to LLC page
  useEffect(() => {
    const STORAGE_KEY_LLC = getUserStorageKey(STORAGE_KEY_LLC_BASE);
    const llcData = localStorage.getItem(STORAGE_KEY_LLC);
    if (llcData) {
      try {
        const data = JSON.parse(llcData);
        const totalExpensesValue = expenses.reduce((sum, exp) => {
          const amount = parseFloat(exp.amountAfterVat || exp.amount || 0);
          return sum + amount;
        }, 0);
        
        // Update expenses in LLC data
        data.expenses = totalExpensesValue.toString();
        localStorage.setItem(STORAGE_KEY_LLC, JSON.stringify(data));
      } catch (e) {
        console.error("Error syncing expenses:", e);
      }
    }
  }, [expenses]);

  // Calculate totals and category breakdown
  const totalExpenses = expenses.reduce((sum, exp) => {
    const amount = parseFloat(exp.amountAfterVat || exp.amount || 0);
    return sum + amount;
  }, 0);

  const categoryTotals = expenses.reduce((acc, exp) => {
    const category = exp.category || "Uncategorized";
    const amount = parseFloat(exp.amountAfterVat || exp.amount || 0);
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});
  
  // Prepare chart data for top categories
  const chartData = Object.entries(categoryTotals)
    .filter(([_, value]) => value > 0)
    .map(([label, value]) => ({
      label: label.length > 20 ? label.substring(0, 20) + "..." : label,
      value: value,
      color: `hsl(${(Object.keys(categoryTotals).indexOf(label) * 137.5) % 360}, 70%, 50%)`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 categories

  const handleAddRow = () => {
    setExpenses([
      ...expenses,
      {
        id: Date.now(),
        date: new Date().toISOString().split("T")[0], // Default to today's date
        vendor: "",
        category: "",
        description: "",
        amount: "",
        isVATable: true,
        vat: "",
        amountAfterVat: "",
        paymentMethod: "",
        deductiblePercent: "100.00",
        taxDeductionAmount: "",
        notes: "",
      },
    ]);
    showToast("New expense row added", "success");
  };

  const handleDeleteRow = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
    showToast("Expense deleted", "info");
  };
  
  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter((exp) => {
      const matchesSearch = 
        !searchTerm ||
        exp.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filterCategory || exp.category === filterCategory;
      
      const matchesDateFrom = !filterDateFrom || exp.date >= filterDateFrom;
      const matchesDateTo = !filterDateTo || exp.date <= filterDateTo;
      
      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    })
    .sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "date":
          aVal = a.date || "";
          bVal = b.date || "";
          break;
        case "amount":
          aVal = parseFloat(a.amountAfterVat || a.amount || 0);
          bVal = parseFloat(b.amountAfterVat || b.amount || 0);
          break;
        case "category":
          aVal = a.category || "";
          bVal = b.category || "";
          break;
        case "vendor":
          aVal = a.vendor || "";
          bVal = b.vendor || "";
          break;
        default:
          return 0;
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  
  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Date", "Vendor/Payee", "Category", "Description", "Amount", 
      "VAT", "Amount After VAT", "Payment Method", "Deductible %", 
      "Tax Deduction Amount", "Notes"
    ];
    
    const rows = filteredExpenses.map(exp => [
      exp.date || "",
      exp.vendor || "",
      exp.category || "",
      exp.description || "",
      exp.amount || "0",
      exp.vat || "0",
      exp.amountAfterVat || exp.amount || "0",
      exp.paymentMethod || "",
      exp.deductiblePercent || "0",
      exp.taxDeductionAmount || "0",
      exp.notes || ""
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast("Expenses exported to CSV", "success");
  };
  
  // Export to PDF (simple text-based)
  const handleExportPDF = () => {
    window.print();
    showToast("Use browser print to save as PDF", "info");
  };

  const handleChange = (id, field, value) => {
    setExpenses(
      expenses.map((exp) => {
        if (exp.id !== id) return exp;
        const updated = { ...exp, [field]: value };

        // Handle VAT/VAT-free toggle
        if (field === "isVATable") {
          updated.isVATable = value === true || value === "true";
          // Recalculate VAT and amount after VAT
          if (updated.amount) {
            const amount = parseFloat(updated.amount) || 0;
            if (updated.isVATable) {
              const vatAmount = amount * VAT_RATE;
              updated.vat = vatAmount.toFixed(2);
              updated.amountAfterVat = (amount + vatAmount).toFixed(2);
            } else {
              updated.vat = "0.00";
              updated.amountAfterVat = amount.toFixed(2);
            }
          }
        }

        // Auto-calculate VAT and amount after VAT
        if (field === "amount" && value) {
          const amount = parseFloat(value) || 0;
          if (updated.isVATable !== false) {
            const vatAmount = amount * VAT_RATE;
            updated.vat = vatAmount.toFixed(2);
            updated.amountAfterVat = (amount + vatAmount).toFixed(2);
          } else {
            updated.vat = "0.00";
            updated.amountAfterVat = amount.toFixed(2);
          }
        }

        // Auto-set deductible % when category changes
        if (field === "category" && value) {
          updated.deductiblePercent = getDefaultDeductible(value).toFixed(2);
          // If Employee Salaries, clear vendor to allow selection
          if (value === "Employee Salaries") {
            updated.vendor = "";
          }
        }

        // Handle employee selection for Employee Salaries
        if (field === "vendor" && updated.category === "Employee Salaries" && value) {
          const selectedEmployee = employees.find(emp => emp.name === value);
          if (selectedEmployee) {
            // Auto-populate monthly salary as amount
            const monthlySalary = parseFloat(selectedEmployee.salary) || 0;
            updated.amount = monthlySalary.toString();
            // Calculate VAT if applicable
            if (updated.isVATable !== false) {
              const vatAmount = monthlySalary * VAT_RATE;
              updated.vat = vatAmount.toFixed(2);
              updated.amountAfterVat = (monthlySalary + vatAmount).toFixed(2);
            } else {
              updated.vat = "0.00";
              updated.amountAfterVat = monthlySalary.toFixed(2);
            }
          }
        }

        // Calculate tax deduction amount
        if (updated.amountAfterVat || updated.amount) {
          const amount = parseFloat(updated.amountAfterVat || updated.amount || 0);
          const deductible = parseFloat(updated.deductiblePercent || 0) / 100;
          updated.taxDeductionAmount = (amount * deductible).toFixed(2);
        }

        return updated;
      })
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Convert date string to YYYY-MM-DD format for date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse common date formats
    try {
      // Handle formats like "1/Jan/2026" or "1/Jan/2"
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      // If parsing fails, return empty string
    }
    
    return "";
  };

  // Convert YYYY-MM-DD to readable format
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = date.getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {
      return dateString;
    }
    
    return dateString;
  };

  return (
    <div className="expense-tracking-container" style={{ marginTop: "24px", marginBottom: "24px", maxWidth: "1400px", marginLeft: "auto", marginRight: "auto", padding: "24px" }}>
      {/* Business/LLC Only Notice */}
      <div style={{
        backgroundColor: "var(--bg-info-soft)",
        border: "1px solid var(--border-info)",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "24px",
        fontSize: "14px",
        color: "var(--text-info)",
        lineHeight: "1.6",
        transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
      }}>
        <div style={{ fontWeight: 600, marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>ℹ️</span>
          <span>Business / LLC Only</span>
        </div>
        <div>
          This expense tracker is designed specifically for <strong>Business / LLC</strong> tax calculations. The expenses tracked here will be automatically synced to your Business / LLC tax calculations page.
        </div>
      </div>

      {/* Header with title and actions */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ color: "var(--primary)", fontSize: "24px", fontWeight: 700, margin: 0, transition: "color 0.3s ease" }}>
            📊 Expense Tracking
          </h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={handleExportCSV}
              className="btn-outline hover-lift"
              style={{ fontSize: "14px", padding: "8px 16px" }}
            >
              📥 Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="btn-outline hover-lift"
              style={{ fontSize: "14px", padding: "8px 16px" }}
            >
              🖨️ Print/PDF
            </button>
          </div>
        </div>
        
        {/* Auto-save indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", transition: "color 0.3s ease" }}>
          {isSaving ? (
            <>
              <span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", transition: "border-color 0.3s ease" }} />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <span>✓</span>
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </>
          ) : null}
        </div>
        
        {/* Search and Filter Bar */}
        <div style={{ 
          backgroundColor: "var(--bg-soft)", 
          padding: "16px", 
          borderRadius: "8px", 
          marginBottom: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          border: "1px solid var(--border)",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              🔍 Search
            </label>
            <input
              type="text"
              placeholder="Search vendor, description, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              📁 Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
              }}
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              📅 From Date
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              📅 To Date
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              🔄 Sort By
            </label>
            <div style={{ display: "flex", gap: "4px" }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-main)",
                  transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                }}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
                <option value="vendor">Vendor</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-main)",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                }}
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
          
          {(searchTerm || filterCategory || filterDateFrom || filterDateTo) && (
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                }}
                className="btn-outline"
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Results count */}
        <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "12px", transition: "color 0.3s ease" }}>
          Showing {filteredExpenses.length} of {expenses.length} expenses
          {filteredExpenses.length !== expenses.length && (
            <StatusBadge status="info" style={{ marginLeft: "8px" }}>
              Filtered
            </StatusBadge>
          )}
        </div>
      </div>

      <div className="expense-tracking-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", width: "100%" }}>
        {/* Main Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
              backgroundColor: "var(--bg-card)",
              transition: "background-color 0.3s ease",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "var(--bg-soft)", borderBottom: "2px solid var(--border)", transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
                <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>DATE</th>
                <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>
                  VENDOR/PAYEE'S NAME
                </th>
                <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>
                  EXPENSE CATEGORY
                </th>
                <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>DESCRIPTION</th>
                <th style={{ padding: "8px", textAlign: "right", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>AMOUNT</th>
                <th style={{ padding: "8px", textAlign: "center", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>VAT</th>
                <th style={{ padding: "8px", textAlign: "right", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>
                  AMOUNT AFTER VAT
                </th>
                <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>
                  PAYMENT METHOD
                </th>
                <th style={{ padding: "8px", textAlign: "right", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>
                  DEDUCTIBLE %
                </th>
                <th style={{ padding: "8px", textAlign: "right", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>
                  TAX DEDUCTION AMOUNT
                </th>
                <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>NOTES</th>
                <th style={{ padding: "8px", textAlign: "center", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ padding: "40px", textAlign: "center", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    <EmptyState
                      icon="📋"
                      title={expenses.length === 0 ? "No expenses yet" : "No expenses match your filters"}
                      message={expenses.length === 0 ? "Start tracking your expenses by adding your first entry below." : "Try adjusting your search or filter criteria."}
                      action={
                        expenses.length === 0 ? (
                          <button onClick={handleAddRow} className="btn-primary">
                            + Add Your First Expense
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setFilterCategory("");
                              setFilterDateFrom("");
                              setFilterDateTo("");
                            }}
                            className="btn-outline"
                          >
                            Clear All Filters
                          </button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp, index) => (
                <tr key={exp.id} style={{ borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                  <td style={{ padding: "4px" }}>
                    <input
                      type="date"
                      value={formatDateForInput(exp.date)}
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        // Store in YYYY-MM-DD format for consistency
                        handleChange(exp.id, "date", dateValue);
                      }}
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-main)",
                        transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                      }}
                      title="Select date"
                    />
                  </td>
                  <td style={{ padding: "4px" }}>
                    {exp.category === "Employee Salaries" ? (
                      <select
                        value={exp.vendor}
                        onChange={(e) => handleChange(exp.id, "vendor", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "4px",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor: "var(--bg-card)",
                          color: "var(--text-main)",
                          transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                        }}
                      >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.name} value={emp.name}>
                            {emp.name} (₦{parseFloat(emp.salary || 0).toLocaleString()}/month)
                          </option>
                        ))}
                        {employees.length === 0 && (
                          <option value="" disabled>No employees found. Add employees in Business/LLC → PAYE</option>
                        )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={exp.vendor}
                        onChange={(e) => handleChange(exp.id, "vendor", e.target.value)}
                        placeholder="Vendor name"
                        style={{
                          width: "100%",
                          padding: "4px",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor: "var(--bg-card)",
                          color: "var(--text-main)",
                          transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                        }}
                      />
                    )}
                  </td>
                  <td style={{ padding: "4px" }}>
                    <select
                      value={exp.category}
                      onChange={(e) => handleChange(exp.id, "category", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "4px",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-main)",
                        transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                      }}
                    >
                      <option value="">Select category</option>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "4px" }}>
                    <input
                      type="text"
                      value={exp.description}
                      onChange={(e) => handleChange(exp.id, "description", e.target.value)}
                      placeholder="Description"
                      style={{
                        width: "100%",
                        padding: "4px",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-main)",
                        transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                      }}
                    />
                  </td>
                  <td style={{ padding: "4px" }}>
                    <input
                      type="number"
                      value={exp.amount}
                      onChange={(e) => handleChange(exp.id, "amount", e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      style={{
                        width: "100%",
                        padding: "4px",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "12px",
                        textAlign: "right",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-main)",
                        transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                      }}
                    />
                  </td>
                  <td style={{ padding: "4px", textAlign: "center" }}>
                    <select
                      value={exp.isVATable === false ? "false" : "true"}
                      onChange={(e) => handleChange(exp.id, "isVATable", e.target.value === "true")}
                      style={{
                        width: "100%",
                        padding: "4px",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "11px",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-main)",
                        transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                      }}
                    >
                      <option value="true">VAT (7.5%)</option>
                      <option value="false">VAT Free</option>
                    </select>
                    {exp.vat && (
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", transition: "color 0.3s ease" }}>
                        {formatCurrency(exp.vat)}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "4px", textAlign: "right", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    {exp.amountAfterVat ? formatCurrency(exp.amountAfterVat) : "-"}
                  </td>
                  <td style={{ padding: "4px" }}>
                    <select
                      value={exp.paymentMethod}
                      onChange={(e) => handleChange(exp.id, "paymentMethod", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "4px",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-main)",
                        transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                      }}
                    >
                      <option value="">Select method</option>
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "4px" }}>
                    <input
                      type="number"
                      value={exp.deductiblePercent}
                      onChange={(e) => handleChange(exp.id, "deductiblePercent", e.target.value)}
                      placeholder="100.00"
                      step="0.01"
                      min="0"
                      max="100"
                      style={{
                        width: "100%",
                        padding: "4px",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "12px",
                        textAlign: "right",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-main)",
                        transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                      }}
                    />
                  </td>
                  <td style={{ padding: "4px", textAlign: "right", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    {exp.taxDeductionAmount ? formatCurrency(exp.taxDeductionAmount) : "-"}
                  </td>
                  <td style={{ padding: "4px" }}>
                    <input
                      type="text"
                      value={exp.notes}
                      onChange={(e) => handleChange(exp.id, "notes", e.target.value)}
                      placeholder="Notes"
                      style={{
                        width: "100%",
                        padding: "4px",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-main)",
                        transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                      }}
                    />
                  </td>
                  <td style={{ padding: "4px", textAlign: "center" }}>
                    <button
                      onClick={() => handleDeleteRow(exp.id)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px",
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
          <button
            onClick={handleAddRow}
            className="btn-primary hover-lift"
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ➕ Add Expense
          </button>
        </div>

        {/* Summary Panel */}
        <div style={{ minWidth: "380px", maxWidth: "380px" }}>
          <div
            style={{
              backgroundColor: "var(--bg-soft)",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
              border: "1px solid var(--border)",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#ef4444", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
                  💰 TOTAL EXPENSES
                </div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px", transition: "color 0.3s ease" }}>
                  {formatCurrency(totalExpenses)}
                  <CopyButton text={totalExpenses.toString()} />
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "var(--primary)",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 600,
                  transition: "background-color 0.3s ease",
                }}
              >
                VAT: {(VAT_RATE * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Chart Visualization */}
          {chartData.length > 0 && (
            <div
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                marginBottom: "16px",
                overflow: "hidden",
                transition: "background-color 0.3s ease, border-color 0.3s ease",
              }}
            >
              <div
                style={{
                  backgroundColor: "var(--primary)",
                  color: "white",
                  padding: "12px",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "background-color 0.3s ease",
                }}
              >
                📊 Top Expense Categories
              </div>
              <SimpleChart data={chartData} />
            </div>
          )}

          <div
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              overflow: "hidden",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}
          >
            <div
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "12px",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              📋 Category Breakdown
            </div>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "var(--bg-soft)", zIndex: 10, transition: "background-color 0.3s ease" }}>
                  <tr style={{ backgroundColor: "var(--bg-soft)", borderBottom: "1px solid var(--border)", transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
                    <th
                      style={{
                        padding: "10px 8px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#3b82f6",
                        backgroundColor: "var(--bg-soft)",
                        transition: "background-color 0.3s ease",
                      }}
                    >
                      Category
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        textAlign: "right",
                        fontWeight: 600,
                        color: "#3b82f6",
                        backgroundColor: "var(--bg-soft)",
                        transition: "background-color 0.3s ease",
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
              <tbody>
                {EXPENSE_CATEGORIES.map((category) => (
                  <tr key={category} style={{ borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                    <td style={{ padding: "10px 8px", fontSize: "11px", lineHeight: "1.5", wordBreak: "break-word", maxWidth: "240px", color: "var(--text-main)", transition: "color 0.3s ease" }} title={category}>
                      {category}
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap", minWidth: "100px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                      {formatCurrency(categoryTotals[category] || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

