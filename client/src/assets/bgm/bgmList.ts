import startbgm from "./startbgm.mp3";
import airportbgm from "./airportbgm.mp3";
import usabgm from "./usabgm.mp3";
import dialogbgm from "./dialogbgm.mp3"

type Bgms = {
    [key: string]: string;
};

const bgms: Bgms = {
    startbgm,
    airportbgm,
    usabgm,
    dialogbgm
};

export default bgms;