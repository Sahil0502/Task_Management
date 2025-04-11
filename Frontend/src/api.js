import axios from "axios";


const BASE_URL = "http://localhost:8080/tasks";


export const getAllTasks = async () => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                // _page:page,
                // _limit: limit
                params:{ jid }
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
};


export const getTaskById = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching task by ID:", error);
        return null;
    }
};
