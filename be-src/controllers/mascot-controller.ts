import { Mascot, User } from "../models/user-mascot";
import { cloudinary } from "../lib/cloudinary";
import { index } from "../lib/algolia";

export async function eliminateMascot(mascotId, objectID) {

    const mascotFound = await Mascot.findByPk(mascotId);
    await mascotFound.destroy();
    await index.deleteObject(objectID);

    return console.log("Mascot eliminated");
}

export async function mascotsCloseFrom(lat, lng) {

    if (lat && lng) {

        const hits = await index.search("", {
            aroundLatLng: [lat, lng].join(','),
        });

        return hits["hits"];

    } else {
        console.error("Falta lat, lng o ambos!");
    }
}

// get all reported pets by a user
export async function allReportedPetsByAUser(email) {

    if (email) {
        const userFounded = await User.findOne({
            where: { email: email },
        });

        console.log(userFounded['id']);
        const allMascotsReported = await Mascot.findAll({
            where: { userId: userFounded['id'] }
        });
        // .catch((err) => {
        //     console.error("Si hay un error en el controller es este: ", err);
        // });

        return allMascotsReported;

    } else {
        console.error('Falta el userId o el mismo no existe');
    }
}

// Report a lost pet
export async function reportLostPet(petName, _geoloc, ImageDataURL, email) {

    if (ImageDataURL && email) {
        
        const userFounded = await User.findOne({
            where: { email: email },
        });

        const imagen = await cloudinary.uploader.upload(ImageDataURL, {

            resource_type: 'image',
            discard_original_filename: true,
            width: 200,
            hegiht: 100,
        })
        // .catch((err) => {
        //     console.log("Esto contiene el error: ", err)
        // });
        
        const mascotCreatedInAlgolia = await index.saveObject({
            petName: petName,
            _geoloc: _geoloc,
            id: Mascot["id"],
            ImageDataURL: imagen["secure_url"],
            userId: userFounded["id"],
        }, {
            autoGenerateObjectIDIfNotExist: true,
        });

        const mascotFounded = await Mascot.findOrCreate({
            where: { petName: petName, userId: userFounded["id"] },
            defaults: {
                petName: petName,
                _geoloc: _geoloc,
                ImageDataURL: imagen["secure_url"],
                userId: userFounded["id"],
                id: Mascot["id"],
                objectID: mascotCreatedInAlgolia["objectID"],
            }
        })
        .catch((err) => {
            console.log("Error desde el controlador de report mascot: ", err);
        });

        // console.log("Esta es la creación de una Mascota: ", mascotCreated);
        // console.log("Este es el encuentro de una Mascota: ", mascotFounded);
        return mascotFounded;

    } else {
        console.error('La imageDataURL no se está pasando bien');
    }
}

// update profile
export async function updateProfile(mascotId, objectID, petName, petPhoto, mascotLocation?) {

    if (mascotId && petName && petPhoto && mascotLocation) {

        let image;
        const imagen = await cloudinary.uploader.upload(petPhoto, function (error, result) {
            image = result.secure_url;
        })
        .catch((err) => {
            console.log("Esto contiene imagen: ", imagen);
            console.log("Esto contiene el error: ", err)
        });

        const allDataComplete = {
            imageDataURL: image,
            petName: petName,
            _geoloc: mascotLocation,
        }

        const mascotUpdated = await index.partialUpdateObject({
            objectID: objectID,
            petName: petName,
            _geoloc: mascotLocation,
            ImageDataURL: imagen["secure_url"],
        });
        const petUpdated = await Mascot.update(allDataComplete,
        {
            where: {
                id: mascotId,
            }
        });

        return petUpdated;
    }
}