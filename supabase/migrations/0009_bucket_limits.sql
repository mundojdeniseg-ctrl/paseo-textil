-- Sube el limite de tamano de archivo en los buckets de fotos.
-- avatars estaba en 5MB (justo para una foto de celular real) y
-- listing-images se creo sin limite explicito -- lo dejamos en 10MB,
-- suficiente para una foto de buena calidad sin exagerar.

update storage.buckets set file_size_limit = 10485760 where id = 'avatars';
update storage.buckets set file_size_limit = 10485760 where id = 'listing-images';
