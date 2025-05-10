import axios from 'axios';

const API_URL = 'https://reservasaabb-production.up.railway.app';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const tournamentService = {
  getAllTournaments: async () => {
    try {
      const response = await axios.get(`${API_URL}/tournaments`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getNextTournament: async () => {
    try {
      const response = await axios.get(`${API_URL}/tournaments/next`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTournamentById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/tournaments/${id}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export const tournamentRegistrationService = {
  register: async (registrationData) => {
    try {
      const response = await axios.post(
        `${API_URL}/tournament-registrations`, 
        registrationData,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMyRegistrations: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/tournament-registrations/my-registrations`,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTournamentRegistrations: async (tournamentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/tournament-registrations/tournament/${tournamentId}`,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateRegistration: async (registrationId, updateData) => {
    try {
      const response = await axios.put(
        `${API_URL}/tournament-registrations/${registrationId}`,
        updateData,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  cancelRegistration: async (registrationId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/tournament-registrations/${registrationId}`,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};