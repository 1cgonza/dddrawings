export interface Imagen {
  ruta: string;
  alt: string;
  coleccion: string;
}

export interface ImagenSEO extends Imagen {
  ancho: string;
  alto: string;
  formato: string;
}
