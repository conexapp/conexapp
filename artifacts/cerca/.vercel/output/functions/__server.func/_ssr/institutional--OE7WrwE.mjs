//#region node_modules/.nitro/vite/services/ssr/assets/institutional--OE7WrwE.js
var LEGAL_UPDATED = "28 de septiembre de 2026";
var LEGAL_VERIFIED = "Verificado según normativa consultada al 28 de septiembre de 2026.";
var pendingContact = {
	type: "note",
	kind: "Pendiente de información legal",
	text: "CONEX todavía no tiene publicados razón social, CUIT, domicilio, teléfono ni correo oficial. Esos datos no se inventan. Mientras tanto, un reclamo de consumo puede presentarse ante la autoridad local y un reclamo de datos personales ante la Agencia de Acceso a la Información Pública."
};
var notCompliance = {
	type: "note",
	kind: "Pendiente de abogado",
	text: "Este texto ordena lo que el sistema hace hoy y la normativa consultada. No es un dictamen. No afirma que CONEX cumpla toda la legislación argentina."
};
function doc(partial) {
	return partial;
}
var institutionalDocs = [
	doc({
		slug: "como-funciona",
		title: "Cómo funciona CONEX",
		group: "CONEX",
		summary: "CONEX conecta compradores y proveedores en Rosario. No fabrica los productos ni los vende como si fueran propios.",
		sections: [
			{
				id: "rol",
				title: "Qué es CONEX",
				blocks: [
					{
						type: "p",
						text: "CONEX es un marketplace local. El proveedor publica. El comprador consulta. El proveedor responde. Si el comprador acepta una respuesta sobre un producto, se arma una compra con ese proveedor."
					},
					{
						type: "p",
						text: "CONEX registra datos de esa operación. No es el fabricante. No es, por el solo hecho de operar la plataforma, el vendedor de todos los productos."
					},
					{
						type: "note",
						kind: "Pendiente de abogado",
						text: "El encuadre jurídico fino de CONEX (intermediario, proveedor de un servicio digital, o integrante de la cadena del artículo 40 de la Ley 24.240 en un caso concreto) tiene que revisarlo un abogado. No se afirma una exención."
					},
					notCompliance
				]
			},
			{
				id: "pasos",
				title: "Pasos que el sistema ya permite",
				blocks: [{
					type: "ul",
					items: [
						"Buscar productos, proveedores o lo que otros están pidiendo.",
						"Consultar un producto o publicar una solicitud, sin mostrar el teléfono ni la dirección de quien pide.",
						"El proveedor responde desde su negocio, si CONEX lo aprobó para publicar.",
						"Si hay aceptación sobre un producto, se genera un pedido con precio y cantidad de ese momento.",
						"El pago protegido dentro de la plataforma es el que se hace con Mercado Pago desde el pedido, cuando esa conexión está activa.",
						"Un arreglo de pago por fuera no entra en ese circuito."
					]
				}, {
					type: "note",
					kind: "Implementado",
					text: "Estos pasos describen el producto actual. No agregan escrow, billetera ni una garantía de reembolso automático."
				}]
			},
			{
				id: "matriz",
				title: "Quién responde",
				blocks: [
					{
						type: "p",
						text: "El reparto de abajo es el del producto hoy. No cierra un juicio. Si la ley puede hacer responsable a más de uno, no se afirma una exención."
					},
					{
						type: "ul",
						items: [
							"Publicación, precio, stock y descripción: los escribe el proveedor. CONEX muestra lo cargado y puede no mostrar un negocio sin aprobar. El comprador no arma la ficha.",
							"Calidad y garantía legal: las debe quien vende, según el artículo 11 de la Ley 24.240 cuando hay relación de consumo. CONEX no las asume por mostrar el producto.",
							"Entrega: la hace el proveedor, por retiro o envío. CONEX no tiene logística. El código confirma la recepción y no libera dinero.",
							"Factura e impuestos del producto: el proveedor. Los impuestos de quien opera CONEX están pendientes de contador.",
							"Pago: Mercado Pago desde el pedido, si el proveedor lo conectó. Un arreglo por fuera no queda como pago protegido. No hay escrow.",
							"Devolución y arrepentimiento, cuando corresponden: los cumple el proveedor que vendió. CONEX muestra el botón y explica el derecho. El código de 24 horas todavía no está.",
							"Reclamo: la disputa interna no le da la razón a nadie de antemano. El consumidor puede ir a la autoridad de Santa Fe o a la Ventanilla Federal.",
							"Datos personales: cada uno carga los suyos. CONEX los usa para la cuenta y el pedido. El canal del responsable está pendiente.",
							"Contenido, marca y productos prohibidos: responde quien publica. CONEX puede ocultar una ficha o suspender un negocio. No reemplaza a una autoridad."
						]
					},
					{
						type: "note",
						kind: "Pendiente de abogado",
						text: "Si en un caso concreto CONEX entra en la solidaridad del artículo 40 de la Ley 24.240, lo tiene que decir un abogado con el hecho. Esta página no lo afirma ni lo niega."
					}
				]
			},
			{
				id: "no",
				title: "Qué CONEX no garantiza",
				blocks: [{
					type: "ul",
					items: [
						"Que una operación no tenga problemas.",
						"Que el comprador o el proveedor siempre tengan razón.",
						"Que todos los pagos estén protegidos. Solo el pago hecho con Mercado Pago desde el pedido entra en ese registro.",
						"Que “negocio aprobado” signifique proveedor confiable. La aprobación habilita a publicar. No es una certificación de calidad.",
						"La entrega. La hace el proveedor, por retiro o envío, según lo que publicó."
					]
				}]
			},
			{
				id: "contacto",
				title: "Contacto",
				blocks: [pendingContact]
			}
		]
	}),
	doc({
		slug: "ayuda",
		title: "Centro de ayuda",
		group: "Ayuda",
		summary: "Mapa corto de lo que ya se puede hacer en CONEX y de los documentos que explican el resto.",
		sections: [
			{
				id: "comprar",
				title: "Cómo comprar",
				blocks: [{
					type: "ul",
					items: [
						"Buscá el producto en Inicio o en Categorías.",
						"Abrí la ficha. Ahí están el precio, la unidad, el stock informado, el proveedor y si ofrece retiro o entrega.",
						"Si no está lo que necesitás, publicalo en Solicitudes. La nota es pública: no escribas teléfono ni dirección.",
						"Si aceptás una respuesta sobre un producto, la compra queda en Mis compras.",
						"Las consultas que enviaste están en Mis consultas."
					]
				}, {
					type: "note",
					kind: "Implementado",
					text: "No hay un checkout genérico fuera de ese circuito de consulta, respuesta y pedido."
				}]
			},
			{
				id: "vender",
				title: "Cómo vender",
				blocks: [{
					type: "ul",
					items: [
						"Entrá y abrí Crear mi negocio. Si declarás ser menor de edad, publicar queda bloqueado. No se pide DNI para eso.",
						"El negocio nuevo queda en revisión. Hasta que CONEX lo aprueba, no publica ni aparece.",
						"Con el negocio disponible, cargá el producto: nombre, precio, unidad, stock, fotos, categoría y si hay retiro o entrega.",
						"Las consultas que te llegan están en Mi negocio, sección Consultas."
					]
				}, {
					type: "note",
					kind: "Regla interna",
					text: "La aprobación del negocio no reemplaza la habilitación municipal del local del proveedor ni sus obligaciones fiscales."
				}]
			},
			{
				id: "autoridades",
				title: "Si el problema no se resuelve en CONEX",
				blocks: [
					{
						type: "p",
						text: "La Dirección Provincial de Defensa del Consumidor de Santa Fe aplica la Ley 24.240. Publica atención en Bv. Pellegrini 3100, Santa Fe, y en Mitre 930, piso 3, Rosario, y los correos consumidor.santafe@santafe.gov.ar y consumidor.rosario@santafe.gov.ar."
					},
					{
						type: "p",
						text: "También existe la Ventanilla Federal Única de Reclamos, creada por la Disposición 890/2025, en argentina.gob.ar/defensadelconsumidor/formulario."
					},
					{
						type: "note",
						kind: "Obligación legal",
						text: "Esos canales son de las autoridades. No son una mesa de ayuda de CONEX ni reemplazan la información que el proveedor debe dar en la compra."
					},
					pendingContact
				]
			}
		]
	}),
	doc({
		slug: "terminos",
		title: "Términos y condiciones",
		group: "Legal",
		summary: "Reglas de uso del marketplace. No renuncian derechos irrenunciables del consumidor.",
		sections: [
			{
				id: "estado",
				title: "Estado de este documento",
				blocks: [notCompliance, {
					type: "note",
					kind: "Documentado",
					text: "Última actualización y vigencia de esta redacción: 28 de septiembre de 2026. Si más adelante cambia, se deja constancia en esta página. No hay un historial anterior publicado en el sitio."
				}]
			},
			{
				id: "aceptacion",
				title: "Aceptación y cuentas",
				blocks: [{
					type: "p",
					text: "Usar CONEX para consultar, comprar, publicar o responder implica aceptar estas reglas en lo que no contradigan una norma imperativa."
				}, {
					type: "ul",
					items: [
						"Usuario es quien tiene cuenta. Comprador es quien consulta o compra. Proveedor es el negocio que ofrece el producto o el servicio.",
						"La cuenta es personal. Los datos de registro tienen que ser verdaderos.",
						"La contraseña no se guarda en texto plano. Quien conoce la clave puede operar la cuenta: no la compartas.",
						"Puede contratar quien tiene capacidad según el Código Civil y Comercial. CONEX no fija por su cuenta una edad distinta de la ley.",
						"Si alguien declara ser menor al crear el negocio, no puede publicar. Eso es una regla del sistema, no un control de documento."
					]
				}]
			},
			{
				id: "operacion",
				title: "Publicaciones, consultas, compras y pagos",
				blocks: [
					{
						type: "p",
						text: "El proveedor es responsable de lo que publica: precio, stock, descripción, entrega y el cumplimiento de su actividad. CONEX puede no mostrar un negocio que no aprobó, o retirar una publicación reportada, pero eso no lo convierte en el vendedor del producto."
					},
					{
						type: "p",
						text: "La compra dentro de CONEX nace cuando se acepta una respuesta sobre un producto. El precio, la cantidad y la comisión quedan los de ese momento. El comprador elige un medio entre los que el proveedor declaró para ese producto. Elegir un medio no confirma el pago. El único cobro que CONEX marca como aprobado es el que Mercado Pago confirma. Transferencia bancaria y las tarjetas que el proveedor declaró quedan como medio elegido, sin confirmación de CONEX."
					},
					{
						type: "note",
						kind: "Pendiente de abogado",
						text: "No se incluye una cláusula que deje sin efecto la información al consumidor, la garantía legal, la revocación en los casos en que corresponde, ni la responsabilidad del artículo 40 de la Ley 24.240."
					}
				]
			},
			{
				id: "conducta",
				title: "Conductas que no se aceptan",
				blocks: [
					{
						type: "ul",
						items: [
							"Fraude, suplantación, phishing o pedir la contraseña de otra persona.",
							"Publicar productos prohibidos o datos falsos.",
							"Amenazar, discriminar o acosar.",
							"Manipular disputas, reseñas o evidencia.",
							"Usar la plataforma para una actividad ilegal."
						]
					},
					{
						type: "p",
						text: "Las medidas internas posibles, cuando el caso está acreditado, van de la advertencia al retiro de una publicación o a la suspensión del negocio. Un fraude, un riesgo físico o una orden de autoridad pueden exigir una medida inmediata. No hay un robot que sancione por una palabra."
					},
					{
						type: "note",
						kind: "Pendiente de configuración técnica",
						text: "El circuito formal de conocer el motivo, aportar descargo y pedir revisión está descripto en Sanciones. Todavía no tiene una pantalla propia."
					}
				]
			},
			{
				id: "cambios",
				title: "Cambios, ley aplicable y reclamos",
				blocks: [
					{
						type: "p",
						text: "CONEX puede actualizar estas reglas. La fecha de esta página es la redacción vigente en el sitio. Un cambio no borra derechos que la ley declara irrenunciables."
					},
					{
						type: "p",
						text: "La relación de consumo, cuando existe, se rige por la Ley 24.240 y por el Código Civil y Comercial. No se pacta acá una prórroga que deje sin efecto el fuero del consumidor."
					},
					pendingContact
				]
			}
		]
	}),
	doc({
		slug: "privacidad",
		title: "Política de privacidad",
		group: "Legal",
		summary: "Qué datos trata hoy CONEX, para qué, y qué derechos reconoce la Ley 25.326.",
		sections: [
			{
				id: "marco",
				title: "Marco",
				blocks: [
					{
						type: "p",
						text: "La Ley 25.326 protege los datos personales asentados en archivos o bases, públicos o privados destinados a dar informes. La Agencia de Acceso a la Información Pública es el órgano de control. El derecho de acceso se responde en 10 días corridos. La rectificación, actualización o supresión, en 5 días hábiles, según informa la propia Agencia."
					},
					{
						type: "note",
						kind: "Obligación legal",
						text: "El DNI no es, por sí solo, un dato sensible en los términos del artículo 2 de la Ley 25.326. CONEX hoy no pide DNI ni guarda constancias de identidad."
					},
					{
						type: "note",
						kind: "Pendiente de abogado",
						text: "La inscripción de la base en el Registro Nacional de Bases de Datos y el texto definitivo de esta política tienen que verlos un abogado. No hay un plazo de 72 horas inventado para avisar un incidente: la Ley 25.326 no lo fija así."
					}
				]
			},
			{
				id: "datos",
				title: "Datos que el sistema puede guardar",
				blocks: [{
					type: "ul",
					items: [
						"Cuenta: nombre, correo y contraseña cifrada, no en texto plano. Teléfono, si lo cargás en Mi cuenta.",
						"Negocio: nombre comercial, razón social declarada, CUIT si se carga, teléfono, correo del negocio, descripción, dirección, barrio, ciudad, provincia, y la ubicación que el proveedor elige mostrar en forma exacta o aproximada.",
						"Publicación: nombre, marca, precio, stock, fotos, categoría y condiciones de retiro o entrega.",
						"Consulta y solicitud: título, cantidad, nota pública y, si hace falta para una entrega, el domicilio que el comprador escribe en ese pedido.",
						"Pedido: estados, importes, código de entrega guardado como hash, disputa con motivo y texto, e historial de acciones.",
						"Reporte de un producto: motivo y detalle, visibles para la administración, no publicados.",
						"Datos técnicos de sesión necesarios para entrar. No hay una herramienta de analítica de terceros declarada en esta versión."
					]
				}, {
					type: "note",
					kind: "Implementado",
					text: "La lista sale del modelo actual. No incluye biometría, documentos escaneados ni una billetera de CONEX."
				}]
			},
			{
				id: "uso",
				title: "Para qué se usan",
				blocks: [{
					type: "ul",
					items: [
						"Crear la cuenta y mantener la sesión.",
						"Mostrar el negocio y el producto a quien busca en Rosario.",
						"Llevar la consulta, la respuesta y el pedido.",
						"Cobrar por Mercado Pago cuando esa cuenta está conectada. El medio de pago trata los datos de la transacción según sus propias reglas.",
						"Revisar un reporte o una disputa.",
						"No se usan para vender una base de contactos. No hay envíos comerciales masivos activados."
					]
				}]
			},
			{
				id: "derechos",
				title: "Derechos de la persona",
				blocks: [
					{
						type: "p",
						text: "Podés pedir acceso, rectificación, actualización o supresión cuando la ley lo permite. La supresión no borra lo que haya que conservar por un pedido, un pago o una disputa ya ocurrida."
					},
					{
						type: "p",
						text: "Si la respuesta no alcanza, la Agencia de Acceso a la Información Pública explica cómo denunciar el incumplimiento del derecho de acceso. También existe la acción de hábeas data."
					},
					pendingContact,
					{
						type: "note",
						kind: "Pendiente de información legal",
						text: "Falta el canal oficial de CONEX para ejercer estos derechos y la dirección del responsable de la base. No se publica un correo inventado."
					}
				]
			}
		]
	}),
	doc({
		slug: "cookies",
		title: "Cookies y almacenamiento local",
		group: "Legal",
		summary: "Solo lo que esta versión usa de verdad. No se declara analítica que no está instalada.",
		sections: [{
			id: "uso",
			title: "Qué hay",
			blocks: [
				{
					type: "p",
					text: "La sesión de la cuenta usa la cookie o el mecanismo de autenticación del sistema para saber quién entró. Sin eso no se puede mantener el ingreso."
				},
				{
					type: "p",
					text: "El mapa puede pedir teselas a un servicio de mapas. Eso es una conexión con ese servicio, no una red publicitaria de CONEX."
				},
				{
					type: "note",
					kind: "Documentado",
					text: "No hay Google Analytics ni un píxel publicitario configurados en esta versión. Si se agregan, esta página tiene que decirlo antes."
				},
				{
					type: "note",
					kind: "Buena práctica",
					text: "Un banner de consentimiento para cookies que no son necesarias solo corresponde si aparecen herramientas de ese tipo. Hoy no se simula ese banner."
				}
			]
		}]
	}),
	doc({
		slug: "seguridad",
		title: "Seguridad",
		group: "Protección",
		summary: "Medidas que ya están y límites que no se disfrazan de certificación.",
		sections: [
			{
				id: "cuenta",
				title: "Cuenta",
				blocks: [{
					type: "ul",
					items: [
						"La contraseña no se guarda en texto plano.",
						"El correo se verifica según el flujo de alta.",
						"Recuperar el acceso se hace con el enlace de restablecimiento, no pidiéndole la clave a nadie.",
						"CONEX no pide la contraseña por mensaje ni por una consulta del marketplace."
					]
				}, {
					type: "note",
					kind: "Pendiente de configuración técnica",
					text: "No hay un segundo factor obligatorio ni un aviso automático de dispositivo nuevo. No se anuncia como si existiera."
				}]
			},
			{
				id: "operacion",
				title: "Operaciones",
				blocks: [{
					type: "ul",
					items: [
						"El código de entrega es de un solo uso, vence a los 7 días y el servidor guarda el hash, no el código.",
						"Validar el código confirma la recepción. No libera dinero al proveedor.",
						"Un reembolso no se marca hecho si Mercado Pago no lo confirma.",
						"Las acciones sensibles quedan en el historial del pedido."
					]
				}, {
					type: "p",
					text: "CONEX puede revisar una operación reportada, pedir una aclaración, ocultar una publicación o suspender un negocio. No puede, por esta política, allanar una cuenta bancaria ni retener fondos que no están en un escrow: no hay escrow."
				}]
			},
			{
				id: "fraude",
				title: "Fraude",
				blocks: [{
					type: "p",
					text: "Cuentas falsas, publicaciones engañosas, manipular un código de entrega o una disputa, y llevarse el pago fuera de la plataforma para esquivar el registro, son conductas que esta regla interna no acepta."
				}, {
					type: "note",
					kind: "Regla interna",
					text: "Colaborar con un requerimiento válido de una autoridad es posible cuando la ley lo exige. El procedimiento interno de seguridad no se publica en detalle, para no facilitar la evasión."
				}]
			}
		]
	}),
	doc({
		slug: "compradores",
		title: "Reglas para compradores",
		group: "Compradores",
		summary: "Qué se espera de quien compra o consulta, y qué derechos no se pueden tachar.",
		sections: [{
			id: "uso",
			title: "Uso de la cuenta",
			blocks: [{
				type: "ul",
				items: [
					"Datos verdaderos y cuenta propia.",
					"No usar las consultas para acosar, hacer spam o pedir credenciales.",
					"No manipular una disputa ni una reseña.",
					"No usar CONEX para una actividad prohibida."
				]
			}, {
				type: "note",
				kind: "Regla interna",
				text: "Estas son reglas de uso. No reemplazan los derechos de quien es consumidor final."
			}]
		}, {
			id: "derechos",
			title: "Derechos cuando hay relación de consumo",
			blocks: [
				{
					type: "p",
					text: "La Ley 24.240 se aplica a la relación de consumo. El Decreto 1798/1994, artículo 2, deja fuera del concepto de consumidor a quien adquiere para integrar el bien o el servicio en un proceso de producción, transformación o comercialización, o para revenderlo."
				},
				{
					type: "ul",
					items: [
						"Información clara sobre el proveedor, el producto, el precio y los costos que se informan, incluida la entrega si se cobra.",
						"Garantía legal del vendedor según el artículo 11 de la Ley 24.240. CONEX no la asume como propia.",
						"Revocación en las compras a distancia cuando el artículo 34 de esa ley y el artículo 1110 del Código Civil y Comercial corresponden, con las excepciones del artículo 1116 y de la Disposición 954/2025.",
						"Reclamar ante la autoridad de consumo de Santa Fe o por la Ventanilla Federal. El COPREC nacional fue disuelto por el Decreto 55/2025. Ese decreto no derogó la Ley 24.240 ni su artículo 40."
					]
				},
				{
					type: "note",
					kind: "Pendiente de abogado",
					text: "Si una compra es entre profesionales, o para reventa, la Ley 24.240 puede no aplicar. CONEX no clasifica sola cada operación."
				}
			]
		}]
	}),
	doc({
		slug: "proveedores",
		title: "Reglas para proveedores",
		group: "Proveedores",
		summary: "El proveedor ofrece y vende. Aprobar el negocio no lo exime de su actividad.",
		sections: [{
			id: "antes",
			title: "Antes de publicar",
			blocks: [{
				type: "ul",
				items: [
					"El negocio queda en revisión hasta que CONEX lo aprueba. Recién entonces puede publicar y aparecer.",
					"Los datos comerciales que carga (nombre, contacto, ubicación, CUIT si lo informa) tienen que ser verdaderos.",
					"Si la actividad exige habilitación, autorización sanitaria o matrícula, eso es del proveedor. La aprobación de CONEX no la reemplaza."
				]
			}, {
				type: "note",
				kind: "Pendiente de abogado",
				text: "Qué documentación puede exigir CONEX de forma razonable, sin pedir de más un dato sensible, queda para revisión legal. Hoy no hay carga de DNI ni de constancia fiscal."
			}]
		}, {
			id: "publicar",
			title: "Al publicar y al vender",
			blocks: [{
				type: "ul",
				items: [
					"Precio, stock, descripción y condiciones de entrega tienen que coincidir con lo que se cumple.",
					"Los costos de envío que se cobran se informan en la publicación o en la respuesta. No se esconden.",
					"Factura, impuestos y la normativa de su rubro los cumple el proveedor.",
					"No publica prohibidos, falsificaciones ni datos personales de más.",
					"No manipula reputación ni se lleva la operación afuera para esquivar el registro cuando la compra nació en CONEX."
				]
			}, {
				type: "note",
				kind: "Obligación legal",
				text: "La Resolución GMC 37/19, incorporada por la Resolución 270/2020 de la Secretaría de Comercio Interior, exige información clara sobre el proveedor, el producto y la transacción en el comercio electrónico. En CONEX, quien ofrece el producto es el proveedor. La ficha muestra el negocio, el precio y las condiciones que él cargó."
			}]
		}]
	}),
	doc({
		slug: "comerciales",
		title: "Reglas comerciales",
		group: "Legal",
		summary: "Qué comisión existe en el código y qué modelos todavía no están activos.",
		sections: [{
			id: "hoy",
			title: "Lo que el sistema ya puede calcular",
			blocks: [
				{
					type: "p",
					text: "Hay una regla de comisión por operación, en puntos básicos, que se congela en el pedido cuando se acepta la cotización. La semilla de desarrollo usa 300 puntos básicos, es decir 3%, pero manda la tasa que quedó congelada y mostrada en esa operación, no un folleto aparte."
				},
				{
					type: "p",
					text: "Si el pago se aprueba por Mercado Pago, esa comisión puede enviarse como marketplace_fee. Si el pago no se aprueba, no hay fee cobrado por ese circuito. El neto del proveedor solo se muestra si Mercado Pago informa su propia comisión."
				},
				{
					type: "note",
					kind: "Implementado",
					text: "Esto describe el código actual. No activa una tarifa nueva."
				}
			]
		}, {
			id: "no",
			title: "Lo que no está definido ni encendido",
			blocks: [{
				type: "ul",
				items: [
					"Plan pago, suscripción o Premium.",
					"Publicidad o puestos destacados pagos.",
					"Una política cerrada de comisión ante cancelación parcial, devolución o fraude, más allá de no marcar un reembolso que Mercado Pago no confirmó."
				]
			}, {
				type: "note",
				kind: "Pendiente de información legal",
				text: "El modelo comercial definitivo, y si la comisión se factura como servicio de CONEX, lo tienen que cerrar la empresa y un contador. No se cobra nada nuevo por estar escrito acá."
			}]
		}]
	}),
	doc({
		slug: "publicaciones",
		title: "Publicaciones y publicidad",
		group: "Legal",
		summary: "La ficha dice lo que el proveedor cargó. Un destacado pago no existe.",
		sections: [{
			id: "ficha",
			title: "Contenido de la ficha",
			blocks: [
				{
					type: "p",
					text: "Precio, unidad, stock, marca, entrega y retiro salen de la publicación. Si un dato no está, la ficha no lo inventa."
				},
				{
					type: "p",
					text: "No hay productos patrocinados. El orden de un listado no es una recomendación paga ni una garantía de calidad."
				},
				{
					type: "note",
					kind: "Obligación legal",
					text: "La Ley 24.240 y el régimen de lealtad comercial no permiten información engañosa. Eso obliga a quien publica el dato. CONEX puede retirar una publicación reportada. No revisa de antemano cada ficha."
				}
			]
		}]
	}),
	doc({
		slug: "prohibidos",
		title: "Productos prohibidos y restringidos",
		group: "Proveedores",
		summary: "Lista de orientación. No declara prohibida una categoría entera si la ley permite vender con autorización.",
		sections: [
			{
				id: "clases",
				title: "Cómo se clasifica",
				blocks: [{
					type: "p",
					text: "Prohibido: no se publica. Restringido: solo si el proveedor tiene la autorización de su rubro y puede demostrarla cuando se le pide. Permitido: el comercio ordinario, igual sujeto a la veracidad de la publicación."
				}, {
					type: "note",
					kind: "Pendiente de abogado",
					text: "Esta lista no reemplaza el régimen de ANMAT, SENASA, ANMAC u otro organismo. El proveedor responde por la norma de su producto."
				}]
			},
			{
				id: "prohibido",
				title: "Prohibido en CONEX",
				blocks: [{
					type: "ul",
					items: [
						"Drogas ilegales y cualquier venta que sea delito.",
						"Armas, municiones o explosivos fuera del marco legal. No se abre una vidriera general de armamento.",
						"Cosas robadas, documentos falsos y falsificaciones.",
						"Contenido sexual ilegal, en especial si involucra a menores.",
						"Especies o partes cuya comercialización está prohibida.",
						"Apuestas no autorizadas y productos financieros que requieran licencia y no la tienen."
					]
				}, {
					type: "note",
					kind: "Regla interna",
					text: "La prohibición de publicarlos en CONEX es una regla de la plataforma. La ilicitud penal, cuando existe, la define el Código Penal y las leyes especiales, no este texto."
				}]
			},
			{
				id: "restringido",
				title: "Restringido: requiere la autorización del rubro",
				blocks: [{
					type: "ul",
					items: [
						"Medicamentos, productos médicos, cosméticos y alimentos cuando la norma sanitaria lo exige.",
						"Productos veterinarios y agroquímicos regulados.",
						"Servicios profesionales que exigen matrícula.",
						"Vehículos, inmuebles y obras, cuando hay régimen propio de información o intermediación.",
						"Animales domésticos, solo dentro de lo que permite la norma de bienestar y sanidad. No se asume que toda publicación de mascotas esté prohibida ni permitida."
					]
				}, {
					type: "note",
					kind: "Pendiente de configuración técnica",
					text: "No hay un interruptor automático de “requiere revisión” por categoría. Si el rubro es sensible, la revisión es manual y todavía no está sistematizada."
				}]
			}
		]
	}),
	doc({
		slug: "propiedad-intelectual",
		title: "Propiedad intelectual",
		group: "Legal",
		summary: "Procedimiento interno de aviso. No crea una autoridad nueva.",
		sections: [{
			id: "regla",
			title: "Qué no se puede publicar",
			blocks: [{
				type: "p",
				text: "La Ley 11.723 protege las obras. Las marcas tienen su propio régimen. En CONEX no se aceptan falsificaciones, fotos o textos copiados sin derecho, ni el uso de una marca ajena para hacer creer que el producto es original."
			}, {
				type: "note",
				kind: "Regla interna",
				text: "CONEX no es el juez de la marca. Puede ocultar la publicación mientras mira el aviso y puede dárselo al proveedor para que responda."
			}]
		}, {
			id: "aviso",
			title: "Cómo avisar",
			blocks: [
				{
					type: "ul",
					items: [
						"Identificá la publicación con su enlace.",
						"Decí qué derecho invocás: marca, foto, texto u obra.",
						"Explicá por qué te corresponde y cómo contactarte.",
						"No hace falta un poder inventado. Sí hace falta un reclamo serio, no un aviso genérico."
					]
				},
				{
					type: "p",
					text: "Hoy ese aviso entra por “Reportar este producto” en la ficha, motivo información engañosa u otro, con el detalle. No hay un formulario separado de propiedad intelectual."
				},
				{
					type: "note",
					kind: "Pendiente de configuración técnica",
					text: "Falta un identificador propio del aviso, la respuesta del proveedor en esa misma pieza y una apelación en pantalla. Hasta entonces el reporte queda para la administración."
				},
				pendingContact
			]
		}]
	}),
	doc({
		slug: "reputacion",
		title: "Reputación",
		group: "Proveedores",
		summary: "No hay un ranking de “mejor proveedor”. Lo que se muestra es acotado.",
		sections: [{
			id: "hoy",
			title: "Qué existe",
			blocks: [{
				type: "p",
				text: "CONEX no arma una lista de más confiables. Un negocio aprobado no se llama confiable. Si hay operaciones terminadas, el perfil puede mostrar ese dato como hecho, no como medalla."
			}, {
				type: "note",
				kind: "Implementado",
				text: "No hay un sistema nuevo de estrellas en esta etapa. No se enciende uno por escribir esta página."
			}]
		}, {
			id: "si",
			title: "Si más adelante hay reseñas",
			blocks: [{
				type: "ul",
				items: [
					"Solo por una operación real.",
					"Sin compra de opiniones ni amenazas.",
					"Sin datos personales innecesarios ni contenido ilegal.",
					"Se puede retirar la que no cumple eso. Una estrella baja no es, por sí sola, una sanción."
				]
			}, {
				type: "note",
				kind: "Regla interna",
				text: "Esta regla queda escrita para cuando exista la función. Hoy no está implementada."
			}]
		}]
	}),
	doc({
		slug: "reclamos",
		title: "Reclamos",
		group: "Protección",
		summary: "Dónde se deja constancia hoy y qué todavía no tiene expediente propio.",
		sections: [{
			id: "canales",
			title: "Canales que ya existen",
			blocks: [{
				type: "ul",
				items: [
					"Problema de una compra: la disputa del pedido, con motivo y texto. Las dos partes pueden dejar mensajes. No se adjuntan fotos.",
					"Publicación: “Reportar este producto”. Queda para un administrador. No se publica.",
					"Consumo no resuelto: Defensa del Consumidor de Santa Fe o la Ventanilla Federal.",
					"Datos personales: el responsable, cuando haya canal, y la Agencia de Acceso a la Información Pública."
				]
			}, {
				type: "note",
				kind: "Pendiente de configuración técnica",
				text: "No hay un expediente único con número, estados y fecha de cierre para todos los motivos (pago, entrega, fraude, marca, privacidad). Abrirlo sería una función nueva. No se simula."
			}]
		}]
	}),
	doc({
		slug: "sanciones",
		title: "Sanciones y revisión",
		group: "Protección",
		summary: "Escala interna. No es automática y no borra el derecho a explicar.",
		sections: [{
			id: "escala",
			title: "Escala",
			blocks: [
				{
					type: "ul",
					items: [
						"Advertencia.",
						"Retiro de la publicación.",
						"Límite de una función.",
						"Suspensión del negocio.",
						"Cierre, solo con un motivo serio y registrado."
					]
				},
				{
					type: "p",
					text: "Fraude, riesgo físico, delito evidente, amenaza o una orden de autoridad pueden saltear la escala. Una disputa o una mala experiencia no son, solas, una sanción."
				},
				{
					type: "note",
					kind: "Regla interna",
					text: "Quien reciba una medida tiene que poder conocer el motivo y aportar su versión. Esa pantalla de revisión está pendiente. Hasta entonces, la suspensión que el sistema ya conoce es la del estado del negocio, decidida por administración."
				},
				{
					type: "note",
					kind: "Pendiente de abogado",
					text: "Las sanciones de la Ley 24.240 las aplica la autoridad, no CONEX. Esta escala es contractual e interna."
				}
			]
		}]
	}),
	doc({
		slug: "cancelaciones",
		title: "Cancelaciones",
		group: "Compradores",
		summary: "Cancelar un pedido no es lo mismo que el arrepentimiento legal.",
		sections: [{
			id: "tipos",
			title: "Qué se distingue",
			blocks: [{
				type: "ul",
				items: [
					"Consulta o solicitud todavía no aceptada: se puede dejar sin efecto en el circuito de consultas, cuando la pantalla lo permite.",
					"Pedido ya armado: el comprador no cancela uno que el proveedor ya está preparando. Esa es una regla del sistema, no el artículo 34.",
					"Falta de stock, imposibilidad de entrega o fraude: se miran en el pedido o en la disputa. El dinero no se simula.",
					"Arrepentimiento del consumidor: es otro instituto. Está en su propia página y no está automatizado."
				]
			}, {
				type: "note",
				kind: "Implementado",
				text: "Los estados del pedido incluyen cancelado, disputado y reembolsado. Reembolsado solo si Mercado Pago lo confirma."
			}]
		}]
	}),
	doc({
		slug: "devoluciones",
		title: "Devoluciones y garantía",
		group: "Compradores",
		summary: "La garantía legal es del vendedor. CONEX no la toma como propia.",
		sections: [{
			id: "garantia",
			title: "Garantía",
			blocks: [{
				type: "p",
				text: "El artículo 11 de la Ley 24.240 pone la garantía legal de las cosas muebles no consumibles en cabeza de quien las vende. Puede coexistir con la garantía del fabricante o con una garantía comercial más amplia. CONEX no es ese vendedor por el solo hecho de mostrar la ficha."
			}, {
				type: "note",
				kind: "Pendiente de abogado",
				text: "El plazo exacto se lee en el texto consolidado del artículo 11. No se convierte acá en una promesa comercial de CONEX ni se publica un número como si fuera política propia."
			}]
		}, {
			id: "cuando",
			title: "Cuándo se habla de devolución",
			blocks: [{
				type: "ul",
				items: [
					"Defecto o diferencia con lo publicado: primero el proveedor, y la disputa del pedido si hace falta dejar constancia.",
					"Arrepentimiento, si corresponde: no exige que el producto esté roto. Tiene excepciones. Ver esa página.",
					"Producto perecedero, personalizado, ya consumido, o compra para reventa: pueden quedar fuera. No se promete una devolución genérica de 30 días."
				]
			}, {
				type: "p",
				text: "En el arrepentimiento que sí corresponde, el artículo 34 dice que el consumidor pone el bien a disposición y los gastos de devolución son del vendedor. El artículo 1115 del Código Civil y Comercial dice que revocar no debe generarle un gasto al consumidor."
			}]
		}]
	}),
	doc({
		slug: "arrepentimiento",
		title: "Botón de arrepentimiento",
		group: "Compradores",
		summary: "Derecho del consumidor en la contratación a distancia. No alcanza a todas las operaciones de CONEX.",
		sections: [
			{
				id: "norma",
				title: "Norma vigente",
				blocks: [
					{
						type: "p",
						text: "El artículo 34 de la Ley 24.240 reconoce revocar la aceptación durante diez días corridos desde la entrega del bien o la celebración del contrato, lo último que ocurra, sin responsabilidad. No se puede renunciar. El vendedor debe informarlo. Los gastos de devolución son del vendedor."
					},
					{
						type: "p",
						text: "El artículo 1110 del Código Civil y Comercial también lo declara irrenunciable en los contratos fuera del establecimiento y a distancia. Si el plazo cae en día inhábil, corre hasta el hábil siguiente. El cómputo puede empezar con la entrega si la aceptación es anterior."
					},
					{
						type: "p",
						text: "La Disposición 954/2025 de la Subsecretaría de Defensa del Consumidor y Lealtad Comercial, publicada en el Boletín Oficial del 4 de septiembre de 2025, derogó las Resoluciones 424/2020 y 316/2018. Exige un enlace llamado “Botón de arrepentimiento”, a simple vista, en lugar destacado y en el primer acceso. La Disposición 3/2026, publicada el 6 de febrero de 2026, permite un control razonable de identidad, por el medio habitual, solo para verificar que pide la persona correcta."
					},
					{
						type: "note",
						kind: "Obligación legal",
						text: "El botón de esta cabecera es ese enlace. No es la Resolución 424/2020."
					}
				]
			},
			{
				id: "cuando-no",
				title: "Cuándo no rige",
				blocks: [
					{
						type: "p",
						text: "La Disposición 954/2025, artículo 3, dice que no rige el botón en estos casos:"
					},
					{
						type: "ul",
						items: [
							"Las excepciones del artículo 1116 del Código Civil y Comercial, salvo pacto en contrario. Ese artículo incluye, entre otras, las cosas hechas a medida o que pueden deteriorarse rápido. La lista completa es la del Código, no un resumen que la reemplace.",
							"Si la persona ya usó o consumió el producto o el servicio y después quiere revocar dentro del plazo.",
							"Si la compra es para revender o para integrar el bien en un proceso de producción, transformación, comercialización o prestación a terceros. Así lo remite también el artículo 2 del Decreto 1798/1994.",
							"Productos perecederos."
						]
					},
					{
						type: "p",
						text: "Entradas y turismo con fecha fija tienen modalidades propias en el artículo 2 de la misma disposición: el plazo de las entradas se cuenta desde la entrega o el comprobante, lo que ocurra primero, y hay que avisar con al menos 24 horas de anticipación al evento o al viaje."
					},
					{
						type: "note",
						kind: "Pendiente de abogado",
						text: "CONEX no decide sola si una operación concreta es de consumo o queda exceptuada. El proveedor del producto es quien debe cumplir el artículo 34 cuando él es el vendedor a distancia."
					}
				]
			},
			{
				id: "estado",
				title: "Qué hace hoy este botón",
				blocks: [
					{
						type: "p",
						text: "El enlace está visible en el primer acceso. Esta página explica el derecho y las excepciones."
					},
					{
						type: "p",
						text: "Dentro de las 24 horas siguientes, la Disposición 954/2025 pide informar un código de la petición y efectivizar la revocación por el mismo medio. Ese registro automático todavía no está construido. No se simula un código."
					},
					{
						type: "p",
						text: "Si ya tenés un pedido, podés dejar constancia en ese pedido o en su disputa. Eso no reemplaza el plazo legal ni produce, por sí, un reembolso. El reembolso de un pago con Mercado Pago solo se marca si Mercado Pago lo confirma."
					},
					{
						type: "note",
						kind: "Pendiente de configuración técnica",
						text: "Falta el formulario que reciba la revocación sin trámites de más, genere el código y avise al proveedor de esa compra."
					},
					pendingContact
				]
			}
		]
	}),
	doc({
		slug: "baja",
		title: "Botón de baja de servicio",
		group: "Compradores",
		summary: "Sirve para dar de baja un servicio contratado. CONEX no tiene hoy una suscripción con el consumidor.",
		sections: [{
			id: "norma",
			title: "Norma",
			blocks: [{
				type: "p",
				text: "El artículo 10 ter de la Ley 24.240 trata la revocación o baja de un servicio. La Disposición 954/2025, artículo 4, exige un enlace llamado “Botón de baja de servicio”, visible en el primer acceso, para pedir esa baja. El artículo 5 pide, en 24 horas, un código y efectivizar la baja. La Disposición 3/2026 permite verificar la identidad de forma razonable."
			}, {
				type: "note",
				kind: "Implementado",
				text: "El enlace de la cabecera cumple el nombre y el lugar visible. No hay, en esta versión, un servicio recurrente de CONEX —suscripción o Premium— que se pueda dar de baja."
			}]
		}, {
			id: "que",
			title: "Qué se puede hacer ahora",
			blocks: [
				{
					type: "ul",
					items: [
						"Si el servicio lo contrataste con un proveedor, la baja es de ese proveedor. CONEX no lo sustituye.",
						"Cerrar la sesión o dejar de usar la cuenta no es la baja del artículo 10 ter.",
						"No se inventa un plan pago para después ofrecer darlo de baja."
					]
				},
				{
					type: "note",
					kind: "Pendiente de configuración técnica",
					text: "Si en el futuro hay un servicio contratado con CONEX, el botón tiene que generar el código en 24 horas. Hoy ese flujo no existe porque no existe el servicio."
				},
				pendingContact
			]
		}]
	}),
	doc({
		slug: "pagos",
		title: "Pagos",
		group: "Protección",
		summary: "CONEX no es una billetera. Mercado Pago es un medio, no una obligación universal.",
		sections: [
			{
				id: "medios",
				title: "Medios",
				blocks: [
					{
						type: "p",
						text: "El proveedor declara qué medios acepta. Esa declaración no prueba que tenga una cuenta o una terminal habilitada. El comprador, al aceptar una respuesta, elige solo entre esos medios. El único medio con cobro integrado es Mercado Pago, y solo si el proveedor lo conectó y hay credenciales. Elegir Mercado Pago no marca el pedido como pagado."
					},
					{
						type: "p",
						text: "Visa Débito, Visa Crédito, Mastercard Débito, Mastercard Crédito, American Express, Cabal, Naranja X y transferencia bancaria pueden quedar registrados como medio elegido si el proveedor los declaró. CONEX no procesa esas tarjetas, no recibe la transferencia y no confirma ese pago ni lo muestra como aprobado."
					},
					{
						type: "note",
						kind: "Implementado",
						text: "No hay escrow. CONEX no retiene el dinero del comprador en una cuenta propia de garantía."
					}
				]
			},
			{
				id: "mp",
				title: "Mercado Pago",
				blocks: [{
					type: "ul",
					items: [
						"El proveedor autoriza la conexión. Puede desconectarla.",
						"La comisión congelada del pedido puede ir como marketplace_fee. La comisión de Mercado Pago es de ese servicio.",
						"El estado approved es el que habilita el cobro en el sistema. Pending, rejected o cancelled no marcan el pedido como pagado.",
						"Un reembolso sin confirmación de Mercado Pago no pasa a reembolsado.",
						"El aviso técnico entra por el webhook, con verificación de firma."
					]
				}, {
					type: "note",
					kind: "Documentado",
					text: "La protección del medio de pago es la de Mercado Pago. La protección de CONEX es el registro de la operación. No se mezclan."
				}]
			},
			{
				id: "impuestos",
				title: "Impuestos",
				blocks: [{
					type: "p",
					text: "La Resolución General ARCA 5794/2025, publicada el 2 de diciembre de 2025, con vigencia el 1 de diciembre de 2025, modifica el régimen de percepción de IVA de la Resolución General 5319 para ventas concertadas en plataformas digitales. Los umbrales publicados incluyen, entre otros, 10 operaciones en el mes y $750.000. La Resolución General 5804/2025 ajusta un régimen de información de plataformas que mueven activos, con otros umbrales, pensado sobre todo para proveedores de servicios de pago."
				}, {
					type: "note",
					kind: "Pendiente de contador",
					text: "No se afirma que CONEX deba percibir IVA ni informar saldos. Tampoco se publica una alícuota de Ingresos Brutos de Santa Fe ni una tasa municipal. Eso lo determina un contador según la actividad real, el domicilio y si CONEX es la plataforma alcanzada o solo el proveedor lo es. No se implementan retenciones."
				}]
			}
		]
	}),
	doc({
		slug: "entregas",
		title: "Entregas",
		group: "Compradores",
		summary: "La logística es del proveedor. CONEX no promete un plazo propio.",
		sections: [{
			id: "modo",
			title: "Retiro y envío",
			blocks: [
				{
					type: "p",
					text: "Cada publicación dice si hay retiro, entrega, costo de envío y horas estimadas de preparación, si el proveedor las cargó. Esos datos son de él."
				},
				{
					type: "p",
					text: "La ubicación del negocio puede mostrarse exacta o aproximada, según lo que eligió. No se publica el domicilio particular de un comprador en el mapa."
				},
				{
					type: "p",
					text: "Cuando el proveedor marca la salida, se genera un código de recepción de un solo uso. Validarlo confirma que se recibió. No libera un pago retenido, porque CONEX no retiene el pago."
				},
				{
					type: "note",
					kind: "Documentado",
					text: "No hay logística propia ni entrega garantizada por CONEX."
				}
			]
		}]
	}),
	doc({
		slug: "disputas",
		title: "Disputas",
		group: "Protección",
		summary: "CONEX no da la razón de antemano.",
		sections: [{
			id: "como",
			title: "Cómo funciona la que ya existe",
			blocks: [
				{
					type: "ul",
					items: [
						"La abre quien corresponde al pedido, con un motivo ya definido y un texto.",
						"Las dos partes pueden escribir. No se suben fotos ni video.",
						"Queda en el historial. Un administrador puede mirarla. No la cierra dándole la razón automática a un lado.",
						"El dinero no se marca devuelto si Mercado Pago no lo confirma."
					]
				},
				{
					type: "p",
					text: "Una disputa no es el arrepentimiento de diez días ni la denuncia penal. Tampoco impide ir a Defensa del Consumidor de Santa Fe."
				},
				{
					type: "note",
					kind: "Implementado",
					text: "El principio vigente del producto sigue igual: la protección depende de lo que quedó registrado."
				}
			]
		}]
	}),
	doc({
		slug: "reportar",
		title: "Reportar un problema",
		group: "Protección",
		summary: "El reporte de una publicación ya existe. Otros reportes todavía no tienen formulario propio.",
		sections: [{
			id: "producto",
			title: "Una publicación",
			blocks: [{
				type: "p",
				text: "En la ficha del producto está “Reportar este producto”. Hace falta entrar. Los motivos actuales son contenido inadecuado, información engañosa u otro, más un detalle. No se publica. Lo ve la administración."
			}, {
				type: "p",
				text: "Sirve también para avisar una falsificación, una foto ajena o un dato peligroso, explicándolo en el detalle."
			}]
		}, {
			id: "otros",
			title: "Proveedor, fraude o cuenta",
			blocks: [
				{
					type: "p",
					text: "No hay un formulario separado para denunciar al proveedor sin abrir uno de sus productos, ni uno de phishing de cuenta. Se puede usar el reporte del producto si el problema está en una ficha. El resto queda pendiente."
				},
				{
					type: "note",
					kind: "Pendiente de configuración técnica",
					text: "No se crea en esta etapa una bandeja nueva de denuncias. No se promete un número de expediente."
				},
				pendingContact
			]
		}]
	}),
	doc({
		slug: "informacion-legal",
		title: "Información legal de CONEX",
		group: "Legal",
		summary: "Lugar reservado para los datos del operador. Hoy están vacíos a propósito.",
		sections: [
			{
				id: "datos",
				title: "Datos del operador",
				blocks: [{
					type: "ul",
					items: [
						"Nombre comercial usado en el sitio: CONEX.",
						"Descripción: Todo lo que necesitás, cerca tuyo.",
						"Ámbito de la operación descripta: Rosario, Santa Fe, Argentina. Eso no es un domicilio legal.",
						"Razón social: pendiente.",
						"CUIT: pendiente.",
						"Domicilio legal: pendiente.",
						"Teléfono y correo de contacto: pendientes."
					]
				}, {
					type: "note",
					kind: "Pendiente de información legal",
					text: "La Resolución GMC 37/19 pide identificar al proveedor antes de contratar. En cada producto, el proveedor identificado es el negocio que lo publica. Los datos de la empresa que opera CONEX se mostrarán en este lugar cuando existan. No se completan con placeholders falsos."
				}]
			},
			{
				id: "habilitacion",
				title: "Rosario y Santa Fe",
				blocks: [
					{
						type: "p",
						text: "La Municipalidad de Rosario habilita establecimientos por su Plataforma de Habilitaciones. Ese permiso es del local físico de cada actividad. La aprobación de un negocio dentro de CONEX no lo reemplaza."
					},
					{
						type: "p",
						text: "Si CONEX tiene que habilitar un local propio, inscribir una actividad o pagar una tasa municipal, depende de si tiene establecimiento y de la actividad declarada. No está resuelto en el producto."
					},
					{
						type: "p",
						text: "En la provincia, la Dirección Provincial de Defensa del Consumidor aplica la Ley 24.240, la Ley 19.511 de metrología legal y el régimen de lealtad comercial. Recibe reclamos y puede citar a audiencia. No es un trámite de CONEX."
					},
					{
						type: "note",
						kind: "Pendiente de abogado",
						text: "Falta el dictamen sobre habilitación de la plataforma, Ingresos Brutos y si el operador debe inscribirse en Rosario aunque no atienda en un local."
					},
					{
						type: "note",
						kind: "Pendiente de contador",
						text: "IVA, Ganancias, Ingresos Brutos y el régimen de plataformas digitales no se liquidan desde esta página."
					}
				]
			},
			{
				id: "atencion",
				title: "Canal de atención",
				blocks: [{
					type: "p",
					text: "La Disposición 954/2025, artículo 6, pide que quien atiende consultas o reclamos por teléfono o por un medio informático informe el canal, el área responsable y un horario que no sea menor al de su operación comercial. Si la atención es solo telefónica o electrónica, ese horario no puede ser inferior a ocho horas en días hábiles."
				}, {
					type: "note",
					kind: "Pendiente de información legal",
					text: "CONEX no tiene teléfono ni correo oficiales publicados. Hasta que existan, no se inventa una mesa de ayuda ni un horario. Las autoridades de consumo de Santa Fe publican los suyos, y no son de CONEX."
				}]
			}
		]
	}),
	doc({
		slug: "comunicaciones",
		title: "Comunicaciones",
		group: "Protección",
		summary: "Consultas, respuestas y solicitudes son el canal. No se usa para pedir claves ni para sacar la compra del registro.",
		sections: [{
			id: "canal",
			title: "Qué se puede escribir",
			blocks: [
				{
					type: "p",
					text: "La consulta, la respuesta del proveedor y la solicitud pública son el canal de CONEX. La nota de una solicitud se muestra. No hace falta el teléfono ni la dirección para pedir un precio."
				},
				{
					type: "ul",
					items: [
						"No se aceptan spam, amenazas, discriminación ni enlaces para robar una cuenta.",
						"Nadie de CONEX pide la contraseña por ese canal.",
						"Un dato de contacto, solo, no es una evasión. Llevarse la operación afuera para esquivar el registro de una compra que nació acá sí es una conducta que esta regla no acepta.",
						"CONEX puede conservar el texto de una consulta o de una disputa ya ocurrida. No publica el reporte de un producto."
					]
				},
				{
					type: "note",
					kind: "Regla interna",
					text: "No hay un moderador automático que sancione por una palabra. Un caso de fraude o de amenaza se mira con el texto y el pedido."
				},
				{
					type: "note",
					kind: "Pendiente de configuración técnica",
					text: "No hay una bandeja general de moderación ni un aviso automático al usuario cuando se oculta un mensaje."
				}
			]
		}]
	})
];
function institutionalDoc(slug) {
	return institutionalDocs.find((item) => item.slug === slug);
}
var institutionalGroups = [
	"CONEX",
	"Compradores",
	"Proveedores",
	"Protección",
	"Ayuda",
	"Legal"
];
//#endregion
export { institutionalGroups as a, institutionalDocs as i, LEGAL_VERIFIED as n, institutionalDoc as r, LEGAL_UPDATED as t };
