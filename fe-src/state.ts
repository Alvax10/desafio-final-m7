// const API_BASE_URL = "http://localhost:3010";
const API_BASE_URL = "https://desafio-final-dwf-m7.herokuapp.com";

const state = {
    data: {
        username: '',
        petName: '',
        email: '',
        location: {
            name: '',
            lat: 0,
            lng: 0,
        },
        userExists: false,
        locationBefore: '/',
        myReportedPets: [],
        lostPetsAround: [],
    },
    listeners: [],
    init() {
        const localData = JSON.parse(localStorage.getItem("geoloc"));
        if (!localData) {
            return;
        }
        this.setState(localData);
    },
    getState() {
        return this.data;
    },
    async sendEmailWithInfo(newLocation, petName, OtherUserEmail, userEmail, numeroDelUsuario, callback) {

        const sendEmailToUser = await fetch(API_BASE_URL + "/report/mascot", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newLocation, petName, OtherUserEmail, userEmail, numeroDelUsuario }),
        })
        .then((res) => { return res.json(); })
        .then((data) => { 
            console.log("Esta es la data de enviar el email: ", data);
        });
        callback();
    },
    async mascotCloseFrom(callback) {
        const currentState = this.getState();
        const lat = currentState["location"]["lat"];
        const lng = currentState["location"]["lng"];

        const mascotsCloseFrom = await fetch(API_BASE_URL + "/mascots-close-from" + "?lat=" + lat + "&lng=" + lng)
        .then((res) => { return res.json(); })
        .then((data) => {

            if (data) {
                console.log("Esta es la data de mascotas cerca de: ", data);
                currentState["lostPetsAround"] = data;
                this.setState(currentState);
                
            } else {
                console.log("No hay mascotas cerca");
            }
        });
        callback();
    },
    async reportLostPet(ImageDataURL, petName, callback) {

        const currentState = this.getState();
        const _geoloc = currentState["location"];
        const email = currentState["email"];

        const reportedPet = await fetch(API_BASE_URL + "/report/mascot", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ petName, _geoloc, ImageDataURL, email }),
        })
        .then((res) => { return res.json(); })
        .then((data) => { 

            if (data) {
                console.log("Esta es la data de reportar mascota perdida: ", data);
                currentState["myReportedPets"] = data;
                state.setState(currentState);
                
            } else {
                console.log("No hay data");
            }
        });
        callback();
    },
    async allReportedPetsByAUser(callback) {
        const currentState = this.getState();
        const email = currentState['email'];

        if (email) {

            const allMascotsByAUser = await fetch(API_BASE_URL+ "/user/reported-mascots" + "?email=" + email, {
                method: 'GET',
            })
            .then((res) => { return res.json(); })
            .then((data) => {

                if (data) {
                    console.log("Esta es la data de todas las mascotas reportadas por un usuario: ", data);
                    currentState["myReportedPets"] = data;
                    state.setState(currentState);
                    
                } else {
                    console.log("No reportaste mascotas");
                }
                return data;
            });
            callback();
            if (callback) callback();

        } else {
            console.error('Falta el email');
        }

    },
    async modifyUserInfo(password) {
        
        await fetch(API_BASE_URL + "/user/data", {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            console.log("Esta es la data de modifyUserInfo: " + data);
        });
    },
    async signUpUser(password) {
        const currentState = this.getState();
        const email = currentState["email"];

        if (!email) {
            console.error('falta el email!');
        } else {

            await fetch(API_BASE_URL + '/auth', {
    
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
        }
    },
    async checkIfUserExists(callback) {
        const currentState = this.getState();
        const email = currentState['email'];

        if (email) {

            await fetch(API_BASE_URL + "/verify/user", {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                // console.log("User exists: ", data);
                currentState['userExists'] = data;
            });
        }
        callback();
    },
    async signInUser(password, callback?) {
        const currentState = this.getState();
        const email = currentState['email'];

        if (email && password) {

            await fetch(API_BASE_URL + '/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                return data;
            });
            callback();

        } else {
            if (callback) console.error('Falta email o contraseña');
        }

    },
    setState(newState) {
        this.data = newState;
        for (const cb of this.listeners) {
            cb();
        }
        localStorage.setItem("geoloc", JSON.stringify(newState));
        console.log("Soy el state, he cambiado:", newState);
    },
    suscribe(callback: (any) => any) {
        this.listeners.push(callback);
    }
}

export { state };