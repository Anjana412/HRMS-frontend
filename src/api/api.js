import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

export const userRegister = async(data) =>{
    try{
        const isFormData = data instanceof FormData;
        const token = localStorage.getItem("token");
        return await axios.post(`${API_URL}/user/register`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : {}),
            }
        });
    }
    catch(error){
        throw error.response?.data || error.message
    }
}

export const userLogin = async(data) =>{
    try {
    return await axios.post(`${API_URL}/user/login`, data);
  } catch (error) {
    throw error.response?.data || error.message;
  }
}


// Get all users by type (HR / Employee / etc.)
export const getUsersByType = async (usertype) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/user/userlist/${usertype}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// Get single user by ID
export const getUserById = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/user/getuserbyid/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const updateUserProfile = async (id, data) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${API_URL}/user/updateprofile/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const deleteUserApi = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_URL}/user/deleteuser/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const createTask = async (taskData) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/tasks/addtask`, taskData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAllTasks = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/tasks/viewtask`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateTask = async (id, taskData) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.put(`${API_URL}/tasks/updatetask/${id}`, taskData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getTaskById = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/tasks/taskdetails/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getTasksByProject = async (projectId) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/tasks/byproject/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteTaskApi = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.delete(`${API_URL}/tasks/deletetask/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};


// ── ATTENDANCE ───────────────────────────────────────────────

export const getMyAttendance = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/attendance/my`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const checkIn = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/attendance/checkin`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const checkOut = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.put(`${API_URL}/attendance/checkout`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const startBreak = async (breakType) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/attendance/startbreak`, { breakType }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const endBreak = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/attendance/endbreak`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAllAttendance = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/attendance/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const exportAttendanceApi = async (attendanceData) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
            `${API_URL}/attendance/export-pdf`,
            { attendanceData },
            {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            }
        );
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const importAttendanceApi = async (formData) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/attendance/import-pdf`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};


// ── LEAVES ───────────────────────────────────────────────────

export const applyLeave = async (leaveData) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/leaves/applyleave`, leaveData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMyLeaves = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/leaves/myleave`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAllLeaveRequests = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/leaves/allleave`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getPendingLeaveApprovals = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/leaves/pendingapprovals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateLeaveStatus = async (id, statusData) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.put(`${API_URL}/leaves/updateleave/${id}`, statusData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};


// ── NOTIFICATIONS ────────────────────────────────────────────

export const getNotifications = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return { notifications: [], unreadCount: 0 };
        const res = await axios.get(`${API_URL}/notifications/getnotification`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const markNotificationsRead = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.put(`${API_URL}/notifications/mark-read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const changePassword = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${API_URL}/user/changepassword`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// ── ORG STRUCTURE ───────────────────────────────────────────

export const getUsersByTypeUnder = async (usertype, managerId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/user/userlist/${usertype}?reportsTo=${managerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMyTeam = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/user/myteam`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDirectReports = async (managerId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/user/directreports/${managerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// ── PROJECTS ─────────────────────────────────────────────────

export const getAllProjects = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/projects/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMyProjects = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/projects/myprojects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProjectById = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createProject = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const isFormData = data instanceof FormData;
    const res = await axios.post(`${API_URL}/projects/create`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
      },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateProject = async (id, data) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${API_URL}/projects/update/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const assignTeamMember = async (projectId, data) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${API_URL}/projects/${projectId}/assign`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const removeTeamMember = async (projectId, userId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_URL}/projects/${projectId}/member/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteProject = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_URL}/projects/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// ── PAYROLL ──────────────────────────────────────────────────

// HR: Get all payrolls with optional filters (?month=&year=&status=&employeeId=)
export const getAllPayroll = async (filters = {}) => {
  try {
    const token = localStorage.getItem("token");
    const params = {};
    if (filters.month)      params.month      = filters.month;
    if (filters.year)       params.year       = filters.year;
    if (filters.status)     params.status     = filters.status;
    if (filters.employeeId) params.employeeId = filters.employeeId;
    const res = await axios.get(`${API_URL}/payroll/hr/get-all-payrolls`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// HR: Generate a payslip for an employee
export const generatePayroll = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${API_URL}/payroll/hr/generate-payslip`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// HR: Mark a payroll record as paid
export const markPayrollAsPaid = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.patch(`${API_URL}/payroll/hr/${id}/mark-as-paid`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// HR: Delete a draft payroll record
export const deletePayrollRecord = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_URL}/payroll/hr/${id}/delete-payroll`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Employee: Get my own payslips
export const getMyPayslips = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/payroll/employee/my-payslips`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Shared: Get a single payslip by ID
export const getPayslipById = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/payroll/get-payslip/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};