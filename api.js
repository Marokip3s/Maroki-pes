/* ==========================================
   MAROKIP3S API
========================================== */

const API = {

    BASE_URL: "https://marokip3s-api.marokip3s.workers.dev/api/public",

    async request() {

        try {

            const response = await fetch(this.BASE_URL, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error("API returned success = false");
            }

            return data;

        } catch (error) {

            console.error("API Error:", error);

            throw error;

        }

    },

    async getData() {

        return await this.request();

    },

    async getMatches() {

        const data = await this.request();
        return data.matches || [];

    },

    async getCompetitions() {

        const data = await this.request();
        return data.competitions || [];

    },

    async getTeams() {

        const data = await this.request();
        return data.teams || [];

    },

    async getServers() {

        const data = await this.request();
        return data.servers || [];

    }

};

window.API = API;