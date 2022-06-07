## Propuesta refactorización

Disculpadme si en algún momento no entendí la lógica del negocio. Algunas partes del código quedan un poco en el aire por no tener acceso a determinados módulos.

Queda pendiente también trabajo de declaración/importación de clases e interfaces para completar adecuadamente la declaración de tipos. En algunos de los casos es posible que en código original esta declaración de tipos se viese completada por el contenido de módulos a los que no tengo acceso.

Además de la refactorización propuesta y ahora que disponemos de módulos y funciones que lo permiten, sería importante añadir al menos tests unitarios y también un test de integración. Disculpadme si no ejecuto esta parte. Creo que ya me estoy escediendo en el tiempo que he dedicado a la prueba pero quiero señalar la importancia de suplir esta carencia.

También entiendo que sería interesante delegar el envío de los correos a un servicio específico que permitiese programar su envío de forma más fiable y controlada.

He dejado anotaciones por el código marcando cuestiones pendientes o para las que necesitaría conocer las user histories o el negocio.