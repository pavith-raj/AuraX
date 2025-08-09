import api from './axiosInstance';

export const getSalons = async () => {
    try {
        const response = await api.get('/salons');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch salons:', error);
        throw error;
    }
};



export const getSalonDetails = async (id) => {
    try {
        const response = await api.get(`/salons/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch salon details for id ${id}:`, error);
        throw error;
    }
};

export const getSalonById = getSalonDetails;

export const updateSalonProfile = async (salonId, updateData) => {
    try {
        const response = await api.put(`/salons/${salonId}`, updateData);
        return response.data;
    } catch (error) {
        console.error(`Failed to update salon profile for id ${salonId}:`, error);
        throw error;
    }
};

export const addSalonGalleryImage = async (salonId, imageUrl) => {
    try {
        const response = await api.post(`/salons/${salonId}/gallery`, { imageUrl });
        return response.data;
    } catch (error) {
        console.error(`Failed to add gallery image for salon ${salonId}:`, error);
        throw error;
    }
};

export const removeSalonGalleryImage = async (salonId, imageUrl) => {
    try {
        const response = await api.delete(`/salons/${salonId}/gallery`, { data: { imageUrl } });
        return response.data;
    } catch (error) {
        console.error(`Failed to remove gallery image for salon ${salonId}:`, error);
        throw error;
    }
};

export const getSalonReviews = async (salonId) => {
    try {
        const response = await api.get(`/salons/${salonId}/reviews`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch reviews for salon ${salonId}:`, error);
        throw error;
    }
};

export const postSalonReview = async (salonId, reviewData) => {
    try {
        const response = await api.post(`/salons/${salonId}/reviews`, reviewData);
        return response.data;
    } catch (error) {
        console.error(`Failed to post review for salon ${salonId}:`, error);
        throw error;
    }
};

export const editSalonReview = async (salonId, reviewId, data) => {
    try {
        const response = await api.put(`/salons/${salonId}/reviews/${reviewId}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to edit review for salon ${salonId}:`, error);
        throw error;
    }
};

export const deleteSalonReview = async (salonId, reviewId) => {
    try {
        const response = await api.delete(`/salons/${salonId}/reviews/${reviewId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete review for salon ${salonId}:`, error);
        throw error;
    }
};

export const getTopSalons = async () => {
    try {
        const response = await api.get('/salons/top');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch top salons:', error);
        throw error;
    }
};

export const updateSalonProfileImage = async (salonId, profileImageUrl) => {
    try {
        const response = await api.put(`/salons/${salonId}/profile-image`, { profileImage: profileImageUrl });
        return response.data;
    } catch (error) {
        console.error(`Failed to update salon profile image for id ${salonId}:`, error);
        throw error;
    }
};

// Service management functions
export const addSalonService = async (salonId, serviceData) => {
    try {
        const response = await api.post(`/salons/${salonId}/services`, serviceData);
        return response.data;
    } catch (error) {
        console.error(`Failed to add service for salon ${salonId}:`, error);
        throw error;
    }
};

export const updateSalonService = async (salonId, serviceId, serviceData) => {
    try {
        const response = await api.put(`/salons/${salonId}/services/${serviceId}`, serviceData);
        return response.data;
    } catch (error) {
        console.error(`Failed to update service ${serviceId} for salon ${salonId}:`, error);
        throw error;
    }
};

export const deleteSalonService = async (salonId, serviceId) => {
    try {
        const response = await api.delete(`/salons/${salonId}/services/${serviceId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete service ${serviceId} for salon ${salonId}:`, error);
        throw error;
    }
};