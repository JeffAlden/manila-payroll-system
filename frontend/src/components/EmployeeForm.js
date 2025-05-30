import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axios from "axios";

const EmployeeForm = ({ visible, onHide, employee, onSave, isEditMode, toast }) => {
  const initialEmployeeState = {
    emp_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    address: "",
    city: "",
    province: "",
    zip: "",
    location: "",
    department: "",
    project: "",
    team: "",
    position: "",
    employment_type: "",
    user_profile: "",
    manager: "",
    vendor: "",
    email: "",
    phone: "",
    ctc_id: "",
    ctc_place: "",
    ctc_date: null,
    ctc_amount: "",
    resident_cert: "",
    notes: "",
    pay_frequency: "",
    sex: "",
    active: true,
    kasambahay: false,
    birthday: null,
    date_hired: null,
    date_regularized: null,
    date_separated: null,
    contract_start: null,
    contract_end: null,
    minimum_wage_earner: false,
    monthly_rate: "",
    tax_id: "",
    sss_number: "",
    philhealth_id: "",
    hdmf_id: "",
    hdmf_account: "",
    bank_name: "",
    bank_account: "",
    rate_type: "",
    base_monthly_pay: "",
    days_per_month: "",
    hours_per_day: "",
    daily_rate: "",
    hourly_rate: "",
    cost_of_living: "",
    representation_allowance: "",
    housing_allowance: "",
    transportation_allowance: "",
    last_updated: "",
  };

  const [formData, setFormData] = useState(initialEmployeeState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && employee && visible) {
      console.log("Employee prop received in EmployeeForm:", employee);
      setFormData({ ...employee });
    } else if (!isEditMode && visible) {
      console.log("Resetting form for add mode");
      setFormData(initialEmployeeState);
    }
  }, [employee, isEditMode, visible]);

  const locations = ["Metro Manila", "Cebu", "Davao"];
  const departments = ["Finance Department", "HR Department", "IT Department"];
  const projects = ["Manila Payroll Project", "Cebu HR System", "Davao Inventory"];
  const teams = ["Product A Team", "Product B Team", "Support Team"];
  const positions = ["Auditor 4", "Manager", "Developer"];
  const employmentTypes = ["Probationary", "Regular", "Contractor"];
  const userProfiles = ["Admin", "User", "Guest"];
  const payFrequencies = ["SemiMonthly", "Monthly"];
  const sexes = ["M", "F"];
  const rateTypes = ["Monthly", "Daily", "Hourly"];

  const validateForm = () => {
    const newErrors = {};
    const today = new Date(); // Current date
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()); // Date 18 years ago

    // Required fields
    if (!formData.emp_id) newErrors.emp_id = "Please enter an Employee ID.";
    if (!formData.first_name) newErrors.first_name = "Please enter the employee's First Name.";
    if (!formData.last_name) newErrors.last_name = "Please enter the employee's Last Name.";
    if (!formData.email) newErrors.email = "Please enter the employee's email address.";
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email))
      newErrors.email = "Please enter a valid email address (e.g., example@domain.com).";
    if (!formData.pay_frequency) newErrors.pay_frequency = "Please select a Pay Frequency.";
    if (!formData.birthday) newErrors.birthday = "Please select the employee's Birthday.";
    else if (formData.birthday > eighteenYearsAgo) newErrors.birthday = "Employee must be at least 18 years old.";
    if (!formData.date_hired) newErrors.date_hired = "Please select the Date Hired.";
    else if (formData.date_hired > today) newErrors.date_hired = "Date Hired cannot be in the future.";
    if (formData.birthday && formData.date_hired && formData.date_hired <= formData.birthday)
      newErrors.date_hired = "Date Hired must be after the employee's Birthday.";
    if (!formData.employment_type) newErrors.employment_type = "Please select an Employment Type.";

    // Optional fields with validation
    if (formData.phone && !/^\d{11}$/.test(formData.phone))
      newErrors.phone = "Phone number must be exactly 11 digits (e.g., 09954654818).";
    if (formData.zip && !/^\d{4}$/.test(formData.zip))
      newErrors.zip = "Zip code must be exactly 4 digits (e.g., 1234).";
    if (formData.monthly_rate && (isNaN(formData.monthly_rate) || formData.monthly_rate <= 0))
      newErrors.monthly_rate = "Monthly Rate must be a positive number.";
    if (formData.cost_of_living && (isNaN(formData.cost_of_living) || formData.cost_of_living < 0))
      newErrors.cost_of_living = "Cost of Living Allowance must be a positive number or zero.";
    if (formData.representation_allowance && (isNaN(formData.representation_allowance) || formData.representation_allowance < 0))
      newErrors.representation_allowance = "Representation Allowance must be a positive number or zero.";
    if (formData.housing_allowance && (isNaN(formData.housing_allowance) || formData.housing_allowance < 0))
      newErrors.housing_allowance = "Housing Allowance must be a positive number or zero.";
    if (formData.transportation_allowance && (isNaN(formData.transportation_allowance) || formData.transportation_allowance < 0))
      newErrors.transportation_allowance = "Transportation Allowance must be a positive number or zero.";
    if (formData.employment_type === "Contractor" && !formData.vendor)
      newErrors.vendor = "Please enter a Vendor name for Contractors.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateForBackend = (date) => {
    if (!date || isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.current.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please fix the errors in the form before saving.",
        life: 3000,
      });
      return;
    }

    const currentTime = new Date().toISOString();
    const dateFields = [
      "ctc_date",
      "birthday",
      "date_hired",
      "date_regularized",
      "date_separated",
      "contract_start",
      "contract_end",
      "last_updated",
    ];
    const updatedEmployee = { ...formData, last_updated: `ADMIN IP:192.168.1.1 DateTime:${currentTime}` };
    dateFields.forEach((field) => {
      if (updatedEmployee[field] instanceof Date) {
        updatedEmployee[field] = formatDateForBackend(updatedEmployee[field]);
      }
    });

    console.log("Saving employee data:", updatedEmployee);

    try {
      const url = isEditMode
        ? `http://localhost:5000/api/employees/${updatedEmployee.emp_id}`
        : "http://localhost:5000/api/employees";
      const method = isEditMode ? "put" : "post";
      const response = await axios[method](url, updatedEmployee);
      console.log("Backend response:", response.data);
      onSave();
      onHide();
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: isEditMode ? "Employee updated" : "Employee added",
        life: 3000,
      });
    } catch (error) {
      console.error("Error saving employee:", error.response || error.message);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save employee",
        life: 3000,
      });
    }
  };

  return (
    <Dialog
      header={isEditMode ? "Edit Employee" : "Add Employee"}
      visible={visible}
      style={{ width: "50vw" }}
      onHide={onHide}
      className="employee-form-dialog"
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto", paddingBottom: "60px" }}>
        <div className="grid">
          <div className="col-12 md:col-6">
            <label className="block mb-1">Employee ID *</label>
            <InputText
              value={formData.emp_id}
              onChange={(e) =>
                setFormData({ ...formData, emp_id: e.target.value })
              }
              className={errors.emp_id ? "p-invalid w-full" : "w-full"}
            />
            {errors.emp_id && <small className="p-error">{errors.emp_id}</small>}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">First Name *</label>
            <InputText
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className={errors.first_name ? "p-invalid w-full" : "w-full"}
            />
            {errors.first_name && (
              <small className="p-error">{errors.first_name}</small>
            )}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Middle Name</label>
            <InputText
              value={formData.middle_name}
              onChange={(e) =>
                setFormData({ ...formData, middle_name: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Last Name *</label>
            <InputText
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className={errors.last_name ? "p-invalid w-full" : "w-full"}
            />
            {errors.last_name && (
              <small className="p-error">{errors.last_name}</small>
            )}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Suffix</label>
            <InputText
              value={formData.suffix}
              onChange={(e) =>
                setFormData({ ...formData, suffix: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12">
            <label className="block mb-1">Address</label>
            <InputTextarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">City</label>
            <InputText
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Province</label>
            <InputText
              value={formData.province}
              onChange={(e) =>
                setFormData({ ...formData, province: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Zip</label>
            <InputText
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              className={errors.zip ? "p-invalid w-full" : "w-full"}
            />
            {errors.zip && <small className="p-error">{errors.zip}</small>}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Location</label>
            <Dropdown
              value={formData.location}
              options={locations}
              onChange={(e) => setFormData({ ...formData, location: e.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Department</label>
            <Dropdown
              value={formData.department}
              options={departments}
              onChange={(e) => setFormData({ ...formData, department: e.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Project</label>
            <Dropdown
              value={formData.project}
              options={projects}
              onChange={(e) => setFormData({ ...formData, project: e.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Team</label>
            <Dropdown
              value={formData.team}
              options={teams}
              onChange={(e) => setFormData({ ...formData, team: e.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Position</label>
            <Dropdown
              value={formData.position}
              options={positions}
              onChange={(e) => setFormData({ ...formData, position: e.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Employment Type</label>
            <Dropdown
              value={formData.employment_type}
              options={employmentTypes}
              onChange={(e) =>
                setFormData({ ...formData, employment_type: e.value })
              }
              className={errors.employment_type ? "p-invalid w-full" : "w-full"}
            />
            {errors.employment_type && (
              <small className="p-error">{errors.employment_type}</small>
            )}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">User Profile</label>
            <Dropdown
              value={formData.user_profile}
              options={userProfiles}
              onChange={(e) =>
                setFormData({ ...formData, user_profile: e.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Manager/Supervisor</label>
            <InputText
              value={formData.manager}
              onChange={(e) =>
                setFormData({ ...formData, manager: e.target.value })
              }
              className="w-full"
            />
          </div>
          {formData.employment_type === "Contractor" && (
            <div className="col-12 md:col-6">
              <label className="block mb-1">Vendor</label>
              <InputText
                value={formData.vendor}
                onChange={(e) =>
                  setFormData({ ...formData, vendor: e.target.value })
                }
                className={errors.vendor ? "p-invalid w-full" : "w-full"}
              />
              {errors.vendor && <small className="p-error">{errors.vendor}</small>}
            </div>
          )}
          <div className="col-12 md:col-6">
            <label className="block mb-1">Email *</label>
            <InputText
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={errors.email ? "p-invalid w-full" : "w-full"}
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Phone</label>
            <InputText
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={errors.phone ? "p-invalid w-full" : "w-full"}
            />
            {errors.phone && <small className="p-error">{errors.phone}</small>}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">CTC/Valid ID</label>
            <InputText
              value={formData.ctc_id}
              onChange={(e) =>
                setFormData({ ...formData, ctc_id: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Place Issued</label>
            <InputText
              value={formData.ctc_place}
              onChange={(e) =>
                setFormData({ ...formData, ctc_place: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">CTC Date</label>
            <Calendar
              value={formData.ctc_date}
              onChange={(e) => setFormData({ ...formData, ctc_date: e.value })}
              className="w-full"
              showIcon
              dateFormat="mm/dd/yy"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Amount Paid</label>
            <InputText
              value={formData.ctc_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ctc_amount: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full"
              type="number"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Resident Certificate</label>
            <InputText
              value={formData.resident_cert}
              onChange={(e) =>
                setFormData({ ...formData, resident_cert: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12">
            <label className="block mb-1">Notes</label>
            <InputTextarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Pay Frequency *</label>
            <Dropdown
              value={formData.pay_frequency}
              options={payFrequencies}
              onChange={(e) =>
                setFormData({ ...formData, pay_frequency: e.value })
              }
              className={errors.pay_frequency ? "p-invalid w-full" : "w-full"}
            />
            {errors.pay_frequency && (
              <small className="p-error">{errors.pay_frequency}</small>
            )}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Sex</label>
            <Dropdown
              value={formData.sex}
              options={sexes}
              onChange={(e) => setFormData({ ...formData, sex: e.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Active</label>
            <Checkbox
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.checked })}
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Kasambahay</label>
            <Checkbox
              checked={formData.kasambahay}
              onChange={(e) =>
                setFormData({ ...formData, kasambahay: e.checked })
              }
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Birthday *</label>
            <Calendar
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.value })}
              className={errors.birthday ? "p-invalid w-full" : "w-full"}
              showIcon
              dateFormat="mm/dd/yy"
            />
            {errors.birthday && (
              <small className="p-error">{errors.birthday}</small>
            )}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Date Hired *</label>
            <Calendar
              value={formData.date_hired}
              onChange={(e) => setFormData({ ...formData, date_hired: e.value })}
              className={errors.date_hired ? "p-invalid w-full" : "w-full"}
              showIcon
              dateFormat="mm/dd/yy"
            />
            {errors.date_hired && (
              <small className="p-error">{errors.date_hired}</small>
            )}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Date Regularized</label>
            <Calendar
              value={formData.date_regularized}
              onChange={(e) =>
                setFormData({ ...formData, date_regularized: e.value })
              }
              className="w-full"
              showIcon
              dateFormat="mm/dd/yy"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Date Separated</label>
            <Calendar
              value={formData.date_separated}
              onChange={(e) =>
                setFormData({ ...formData, date_separated: e.value })
              }
              className="w-full"
              showIcon
              dateFormat="mm/dd/yy"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Contract Start</label>
            <Calendar
              value={formData.contract_start}
              onChange={(e) =>
                setFormData({ ...formData, contract_start: e.value })
              }
              className="w-full"
              showIcon
              dateFormat="mm/dd/yy"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Contract End</label>
            <Calendar
              value={formData.contract_end}
              onChange={(e) =>
                setFormData({ ...formData, contract_end: e.value })
              }
              className="w-full"
              showIcon
              dateFormat="mm/dd/yy"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Minimum Wage Earner</label>
            <Checkbox
              checked={formData.minimum_wage_earner}
              onChange={(e) =>
                setFormData({ ...formData, minimum_wage_earner: e.checked })
              }
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Monthly Rate</label>
            <InputText
              value={formData.monthly_rate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthly_rate: parseFloat(e.target.value) || 0,
                })
              }
              className={errors.monthly_rate ? "p-invalid w-full" : "w-full"}
              type="number"
            />
            {errors.monthly_rate && (
              <small className="p-error">{errors.monthly_rate}</small>
            )}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Tax ID</label>
            <InputText
              value={formData.tax_id}
              onChange={(e) =>
                setFormData({ ...formData, tax_id: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">SSS/GSIS Number</label>
            <InputText
              value={formData.sss_number}
              onChange={(e) =>
                setFormData({ ...formData, sss_number: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">PhilHealth ID</label>
            <InputText
              value={formData.philhealth_id}
              onChange={(e) =>
                setFormData({ ...formData, philhealth_id: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">HDMF ID</label>
            <InputText
              value={formData.hdmf_id}
              onChange={(e) =>
                setFormData({ ...formData, hdmf_id: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">HDMF Account</label>
            <InputText
              value={formData.hdmf_account}
              onChange={(e) =>
                setFormData({ ...formData, hdmf_account: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Bank Name</label>
            <InputText
              value={formData.bank_name}
              onChange={(e) =>
                setFormData({ ...formData, bank_name: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Bank Account</label>
            <InputText
              value={formData.bank_account}
              onChange={(e) =>
                setFormData({ ...formData, bank_account: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Rate Type</label>
            <Dropdown
              value={formData.rate_type}
              options={rateTypes}
              onChange={(e) => setFormData({ ...formData, rate_type: e.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Base Monthly Pay</label>
            <InputText
              value={formData.base_monthly_pay}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  base_monthly_pay: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full"
              type="number"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Days per Month</label>
            <InputText
              value={formData.days_per_month}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  days_per_month: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full"
              type="number"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Hours per Day</label>
            <InputText
              value={formData.hours_per_day}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hours_per_day: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full"
              type="number"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Daily Rate</label>
            <InputText
              value={formData.daily_rate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  daily_rate: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full"
              type="number"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Hourly Rate</label>
            <InputText
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hourly_rate: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full"
              type="number"
            />
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Cost of Living Allowance</label>
            <InputText
              value={formData.cost_of_living}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost_of_living: parseFloat(e.target.value) || 0,
                })
              }
              className={errors.cost_of_living ? "p-invalid w-full" : "w-full"}
              type="number"
            />
            {errors.cost_of_living && (
              <small className="p-error">{errors.cost_of_living}</small>
            )}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Representation Allowance</label>
            <InputText
              value={formData.representation_allowance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  representation_allowance: parseFloat(e.target.value) || 0,
                })
              }
              className={errors.representation_allowance ? "p-invalid w-full" : "w-full"}
              type="number"
            />
            {errors.representation_allowance && (
              <small className="p-error">{errors.representation_allowance}</small>
            )}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Housing Allowance</label>
            <InputText
              value={formData.housing_allowance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  housing_allowance: parseFloat(e.target.value) || 0,
                })
              }
              className={errors.housing_allowance ? "p-invalid w-full" : "w-full"}
              type="number"
            />
            {errors.housing_allowance && (
              <small className="p-error">{errors.housing_allowance}</small>
            )}
          </div>
          <div className="col-12 md:col-6">
            <label className="block mb-1">Transportation Allowance</label>
            <InputText
              value={formData.transportation_allowance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  transportation_allowance: parseFloat(e.target.value) || 0,
                })
              }
              className={errors.transportation_allowance ? "p-invalid w-full" : "w-full"}
              type="number"
            />
            {errors.transportation_allowance && (
              <small className="p-error">{errors.transportation_allowance}</small>
            )}
          </div>
        </div>
      </div>
      <div className="button-bar" style={{ position: "sticky", bottom: 0, background: "#ffffff", padding: "10px", borderTop: "1px solid #ddd", zIndex: 10 }}>
        <div className="flex gap-2">
          <Button label="Save" icon="pi pi-check" onClick={handleSave} />
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={onHide}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default EmployeeForm;