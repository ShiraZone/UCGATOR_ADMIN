import createRefresh from "react-auth-kit/createRefresh";

// AXIOS
import axios from "axios";

// refresh function
export const refresh = createRefresh({
    interval: 10,
    refreshApiCallback: async (param) => {
        try {
            const response = await axios.post("/refresh", param, {
                headers: { 'Authorization': `Bearer ${param.authToken}` }
            })
            console.log("Refreshing")
            return {
                isSuccess: true,
                newAuthToken: response.data.token,
                newAuthTokenExpireIn: 10,
                newRefreshTokenExpiresIn: 60
            }
        }
        catch (error) {
            console.error(error)
            return {
                isSuccess: false,
                newAuthToken: "",
                newAuthTokenExpireIn: 0,
                newRefreshTokenExpiresIn: 0
            }
        }
    }
})