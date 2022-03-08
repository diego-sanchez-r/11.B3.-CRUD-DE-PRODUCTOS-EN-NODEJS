const mongoose = require('mongoose');
const EquiposSchema = mongoose.Schema(
{
    nombre: {
        type:String,
        required: [true,'El nombre es obligatorio']
    },
    ciudad: {
        type:String,
        required: [true,'La ciudad es obligatoria']
    },
    goles: {
        type:String,
        required: [true,'Los goles son obligatorios']
    },
    imagen: {
        type:String
    },
}
)
//sobreescribimos un método del Schema para modificar el objeto que exporta
EquiposSchema.methods.toJSON = function() {
    const { _id,...equipo} = this.toObject() ;
    equipo.id=_id;
    return equipo;
}

let Equipo = mongoose.model('Equipo',EquiposSchema);
module.exports = Equipo;