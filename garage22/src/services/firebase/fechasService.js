import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Alta: crea un nuevo documento en la colección 'fechas'.
 * @param {object} data - { lugar, fechaHora (string datetime-local), ciudad?, descripcion?, linkEntradas? }
 * @param {string} userId - uid del admin autenticado
 */
export async function crearFecha(data, userId) {
  const { lugar, fechaHora, ciudad, descripcion, linkEntradas } = data;

  const doc_data = {
    lugar,
    fechaHora:  Timestamp.fromDate(new Date(fechaHora)),
    createdAt:  serverTimestamp(),
    createdBy:  userId,
  };

  if (ciudad)       doc_data.ciudad       = ciudad;
  if (descripcion)  doc_data.descripcion  = descripcion;
  if (linkEntradas) doc_data.linkEntradas = linkEntradas;

  await addDoc(collection(db, 'fechas'), doc_data);
}

/**
 * Modificación: actualiza campos de un documento existente.
 * @param {string} id - ID del documento
 * @param {object} data - campos a modificar (misma forma que crearFecha)
 * @param {string} userId - uid del admin autenticado
 */
export async function actualizarFecha(id, data, userId) {
  const { lugar, fechaHora, ciudad, descripcion, linkEntradas } = data;

  const updates = {
    lugar,
    fechaHora:  Timestamp.fromDate(new Date(fechaHora)),
    updatedAt:  serverTimestamp(),
    updatedBy:  userId,
    // Siempre escribir campos opcionales (vacío = limpia el valor anterior)
    ciudad:       ciudad       ?? '',
    descripcion:  descripcion  ?? '',
    linkEntradas: linkEntradas ?? '',
  };

  await updateDoc(doc(db, 'fechas', id), updates);
}

/**
 * Baja física: elimina el documento de Firestore.
 * @param {string} id - ID del documento
 */
export async function eliminarFecha(id) {
  await deleteDoc(doc(db, 'fechas', id));
}
