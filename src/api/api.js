import axios from 'axios'

const API_URL = "http://localhost:4000"

// const API_URL = "https://hr-management-system-2-qrdd.onrender.com"

export const userRegister = async(data) =>{
    try{
        return await axios.post(`${API_URL}/user/register`,data);
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


// Get all users by type (HR / Employee)
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


// Get single user by ID (optional)
export const getUserById = async (id) => {
  try {
    const token = localStorage.getItem("token");
    // Updated URL to match your custom backend path
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
        const token = localStorage.getItem("token"); // Manually get token
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





// attendance API section
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
        // Using PUT here because we are UPDATING an existing attendance record
        const res = await axios.put(`${API_URL}/attendance/checkout`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};


// Add this to your api.js
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
// Ensure this is exactly like this in api.js
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



// Add these to your api.js

// Fetch ALL leaves for HR/Admin
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

// Update status (Approve/Reject)
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



// Export Attendance as PDF
export const exportAttendanceApi = async (attendanceData) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
            `${API_URL}/attendance/export-pdf`,
            { attendanceData },
            {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', // ← CRITICAL: tells axios to treat response as binary
            }
        );
        return res.data; // returns the raw Blob
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Import Attendance PDF (using FormData for Multer/Cloudinary)
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







export const getNotifications = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return { notifications: [], unreadCount: 0 }; // ← skip if not logged in
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