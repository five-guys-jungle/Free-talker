export default class AuthService {
    async login(username: string, password: string) {
        return {
            username: "test",
            token: "1234567890",
        };
    }

    async logout() {
        return;
    }

    async signup(id: string, password: string, username: string) {
        return {
            username: "test",
            token: "1234567890",
        };
    }
}
