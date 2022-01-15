// const API_BASE_URL = "http://localhost:3011";
const API_BASE_URL = "https://desafio-final-dwf-m7.herokuapp.com/";

const state = {
    data: {
        username: '',
        petName: '',
        email: '',
        _geoloc: {
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

        const sendEmailToUser = await fetch(API_BASE_URL + "/send-email-to-user", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newLocation, petName, OtherUserEmail, userEmail, numeroDelUsuario }),
        })
        .then((res) => { return res.json(); })
        .then((data) => { 
            console.log("Esta es la data de enviar el email: ", data);
        })
        .catch((err) => {
            console.log("Este es el error de send email: ", err);
        });

        console.log(sendEmailToUser);
        callback();
    },
    async mascotCloseFrom(callback) {
        const currentState = this.getState();
        const lat = currentState["_geoloc"]["lat"];
        const lng = currentState["_geoloc"]["lng"];

        const mascotsCloseFrom = await fetch(API_BASE_URL + "/mascots-close-from" + "?lat=" + lat + "&lng=" + lng, {
            mode: 'cors',
            credentials: 'omit',
        })
        .then((res) => { return res.json(); })
        .then((data) => {

            if (data) {
                console.log("Esta es la data de mascotas cerca de: ", data);
                currentState["lostPetsAround"] = data;
                
            } else {
                console.log("No hay mascotas cerca");
            }
        })
        .catch((err) => {
            console.log("Este es el error de mascots close from: ", err);
        });

        callback();
    },
    async reportLostPet(petName, ImageDataURL, _geoloc, callback) {
        const currentState = this.getState();
        const email = currentState["email"];

        const reportedPet = await fetch(API_BASE_URL + "/report/mascot", {
           method: 'POST',
           headers: {
            'Content-Type': 'application/json',
           },
           body: JSON.stringify({ petName, _geoloc, ImageDataURL, email }),
        })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
           console.log(data);
        })
        .catch((err) => {
            console.log("Este es el error de report mascot: ", err);
        });

        callback();
    },
    async allReportedPetsByAUser(callback) {
        const currentState = this.getState();
        const email = currentState['email'];

        if (email) {

            const allMascotsByAUser = await fetch(API_BASE_URL + "/user/reported-mascots" + "?email=" + email, {
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
            })
            .catch((err) => {
                console.log("Este es el error de mascots reported by a user: ", err);
            });

            callback();

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
        })
        .catch((err) => {
            console.log("Este es el error de modify user info: ", err);
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
            })
            .catch((err) => {
                console.log("Este es el error de sign up user: ", err);
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
            })
            .catch((err) => {
                console.log("Este es el error de check if user exists: ", err);
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
            })
            .catch((err) => {
                console.log("Este es el error de sign in user: ", err);
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