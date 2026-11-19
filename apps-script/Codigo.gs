/**
 * Job Post ATS Analizer — intermediario de IA (Google Apps Script)
 *
 * La clave de API queda guardada en las Propiedades del script: nunca viaja al navegador.
 *
 * Propiedades del script (Configuración del proyecto ⚙️ → Propiedades del script):
 *   PROVEEDOR      gemini | claude          (por defecto: gemini)
 *   CLAVE_API      tu clave de API del proveedor
 *   TOKEN          el token que genera la app en "Configurar IA" (protege tu clave de usos ajenos)
 *   MODELO         opcional (por defecto: gemini-flash-latest | claude-haiku-5-5)
 *   LIMITE_DIARIO  opcional, consultas por día (por defecto: 100)
 *
 * Implementar → Nueva implementación → Aplicación web
 *   Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario
 * Copiá la URL que termina en /exec y pegala en la app junto con el TOKEN.
 */
const MODELOS = {gemini: "gemini-flash-latest", claude: "claude-haiku-5-5"};

function doGet(){ return salida({ok: true, app: "jobpost-ia"}); }

function doPost(e){
  try{
    const P = PropertiesService.getScriptProperties();
    const req = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const token = P.getProperty("TOKEN");
    if(!token) return salida({error: "Falta la propiedad TOKEN en el script."});
    if(req.token !== token) return salida({error: "Token incorrecto."});
    const clave = P.getProperty("CLAVE_API");
    if(!clave) return salida({error: "Falta la propiedad CLAVE_API en el script."});
    const prov = String(P.getProperty("PROVEEDOR") || "gemini").toLowerCase();
    if(!MODELOS[prov]) return salida({error: "PROVEEDOR debe ser gemini o claude."});
    const modelo = String(req.modelo || P.getProperty("MODELO") || MODELOS[prov]);

    // Límite diario de consultas
    const hoy = Utilities.formatDate(new Date(), "America/Argentina/Buenos_Aires", "yyyy-MM-dd");
    const lim = Number(P.getProperty("LIMITE_DIARIO") || 100);
    const k = "uso_" + hoy;
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    const usados = Number(P.getProperty(k) || 0);
    if(usados >= lim){ lock.releaseLock(); return salida({error: "Se alcanzó el límite diario de " + lim + " consultas."}); }
    P.setProperty(k, String(usados + 1));
    lock.releaseLock();
    P.getKeys().filter(x => x.indexOf("uso_") === 0 && x !== k).forEach(x => P.deleteProperty(x));

    if(req.prueba) return salida({texto: '{"ok":true}', modelo: modelo, usados: usados + 1, limite: lim});
    const system = String(req.system || "").slice(0, 20000);
    const prompt = String(req.prompt || "").slice(0, 80000);
    const max = Math.min(Number(req.max_tokens) || 4000, 8000);
    let texto = "";
    if(prov === "claude"){
      const r = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", {
        method: "post", contentType: "application/json", muteHttpExceptions: true,
        headers: {"x-api-key": clave, "anthropic-version": "2023-06-01"},
        payload: JSON.stringify({model: modelo, max_tokens: max, system: system, messages: [{role: "user", content: prompt}]})
      });
      const j = JSON.parse(r.getContentText() || "{}");
      if(r.getResponseCode() >= 300) return salida({error: (j.error && j.error.message) || ("Claude respondió " + r.getResponseCode())});
      texto = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    } else {
      const r = UrlFetchApp.fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(modelo) + ":generateContent", {
        method: "post", contentType: "application/json", muteHttpExceptions: true,
        headers: {"x-goog-api-key": clave},
        payload: JSON.stringify({systemInstruction: {parts: [{text: system}]}, contents: [{role: "user", parts: [{text: prompt}]}],
          generationConfig: {maxOutputTokens: max * 2, responseMimeType: "application/json"}})
      });
      const j = JSON.parse(r.getContentText() || "{}");
      if(r.getResponseCode() >= 300) return salida({error: (j.error && j.error.message) || ("Gemini respondió " + r.getResponseCode())});
      const c = (j.candidates || [])[0];
      texto = c && c.content && c.content.parts ? c.content.parts.map(p => p.text || "").join("") : "";
    }
    return salida({texto: texto, modelo: modelo, usados: usados + 1, limite: lim});
  } catch(err){
    return salida({error: String((err && err.message) || err)});
  }
}

function salida(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
