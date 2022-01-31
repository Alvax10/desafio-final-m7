import "./router";
import "./pages/give-location";
import "./pages/home";
import "./pages/login1";
import "./pages/login2";
import "./pages/mis-datos";
import "./pages/mis-mascotas-reportadas";
import "./pages/reportar-mascota";
import "./pages/edit-pet";
import { state } from "./state";
require("./components/header");
require("./components/lost-pet-card");
require("./components/my-lost-pets");

state.init();