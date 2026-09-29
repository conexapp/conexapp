import { r as __exportAll } from "../_runtime.mjs";
import { o as require_protocols, u as require_endpoints } from "./@aws-sdk/checksums+[...].mjs";
import { d as init_dist_es, f as SignatureV4MultiRegion, l as require_util } from "./@aws-sdk/client-s3+[...].mjs";
//#region node_modules/@aws-sdk/s3-request-presigner/dist-es/constants.js
var import_endpoints = require_endpoints();
var import_protocols = require_protocols();
init_dist_es();
var import_util = require_util();
var UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
var SHA256_HEADER = "X-Amz-Content-Sha256";
//#endregion
//#region node_modules/@aws-sdk/s3-request-presigner/dist-es/presigner.js
var S3RequestPresigner = class {
	signer;
	constructor(options) {
		const resolvedOptions = {
			service: options.signingName || options.service || "s3",
			uriEscapePath: options.uriEscapePath || false,
			applyChecksum: options.applyChecksum || false,
			...options
		};
		this.signer = new SignatureV4MultiRegion(resolvedOptions);
	}
	presign(requestToSign, { unsignableHeaders = /* @__PURE__ */ new Set(), hoistableHeaders = /* @__PURE__ */ new Set(), unhoistableHeaders = /* @__PURE__ */ new Set(), ...options } = {}) {
		this.prepareRequest(requestToSign, {
			unsignableHeaders,
			unhoistableHeaders,
			hoistableHeaders
		});
		return this.signer.presign(requestToSign, {
			expiresIn: 900,
			unsignableHeaders,
			unhoistableHeaders,
			...options
		});
	}
	presignWithCredentials(requestToSign, credentials, { unsignableHeaders = /* @__PURE__ */ new Set(), hoistableHeaders = /* @__PURE__ */ new Set(), unhoistableHeaders = /* @__PURE__ */ new Set(), ...options } = {}) {
		this.prepareRequest(requestToSign, {
			unsignableHeaders,
			unhoistableHeaders,
			hoistableHeaders
		});
		return this.signer.presignWithCredentials(requestToSign, credentials, {
			expiresIn: 900,
			unsignableHeaders,
			unhoistableHeaders,
			...options
		});
	}
	prepareRequest(requestToSign, { unsignableHeaders = /* @__PURE__ */ new Set(), unhoistableHeaders = /* @__PURE__ */ new Set(), hoistableHeaders = /* @__PURE__ */ new Set() } = {}) {
		unsignableHeaders.add("content-type");
		Object.keys(requestToSign.headers).map((header) => header.toLowerCase()).filter((header) => header.startsWith("x-amz-server-side-encryption")).forEach((header) => {
			if (!hoistableHeaders.has(header)) unhoistableHeaders.add(header);
		});
		requestToSign.headers[SHA256_HEADER] = UNSIGNED_PAYLOAD;
		const currentHostHeader = requestToSign.headers.host;
		const port = requestToSign.port;
		const expectedHostHeader = `${requestToSign.hostname}${requestToSign.port != null ? ":" + port : ""}`;
		if (!currentHostHeader || currentHostHeader === requestToSign.hostname && requestToSign.port != null) requestToSign.headers.host = expectedHostHeader;
	}
};
//#endregion
//#region node_modules/@aws-sdk/s3-request-presigner/dist-es/getSignedUrl.js
var getSignedUrl = async (client, command, options = {}) => {
	let s3Presigner;
	let region;
	if (typeof client.config.endpointProvider === "function") {
		const authScheme = (await (0, import_endpoints.getEndpointFromInstructions)(command.input, command.constructor, client.config)).properties?.authSchemes?.[0];
		if (authScheme?.name === "sigv4a") region = authScheme?.signingRegionSet?.join(",");
		else region = authScheme?.signingRegion;
		s3Presigner = new S3RequestPresigner({
			...client.config,
			signingName: authScheme?.signingName,
			region: async () => region
		});
	} else s3Presigner = new S3RequestPresigner(client.config);
	const presignInterceptMiddleware = (next, context) => async (args) => {
		const { request } = args;
		if (!import_protocols.HttpRequest.isInstance(request)) throw new Error("Request to be presigned is not an valid HTTP request.");
		delete request.headers["amz-sdk-invocation-id"];
		delete request.headers["amz-sdk-request"];
		delete request.headers["x-amz-user-agent"];
		let presigned;
		const presignerOptions = {
			...options,
			signingRegion: options.signingRegion ?? context["signing_region"] ?? region,
			signingService: options.signingService ?? context["signing_service"]
		};
		if (context.s3ExpressIdentity) presigned = await s3Presigner.presignWithCredentials(request, context.s3ExpressIdentity, presignerOptions);
		else presigned = await s3Presigner.presign(request, presignerOptions);
		return {
			response: {},
			output: {
				$metadata: { httpStatusCode: 200 },
				presigned
			}
		};
	};
	const middlewareName = "presignInterceptMiddleware";
	const clientStack = client.middlewareStack.clone();
	clientStack.addRelativeTo(presignInterceptMiddleware, {
		name: middlewareName,
		relation: "before",
		toMiddleware: "awsAuthMiddleware",
		override: true
	});
	const { output } = await command.resolveMiddleware(clientStack, client.config, {})({ input: command.input });
	const { presigned } = output;
	return (0, import_util.formatUrl)(presigned);
};
//#endregion
//#region node_modules/@aws-sdk/s3-request-presigner/dist-es/index.js
var dist_es_exports = /* @__PURE__ */ __exportAll({ getSignedUrl: () => getSignedUrl });
//#endregion
export { dist_es_exports as t };
