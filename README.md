# Job Post ATS Analizer 🎯

App web para analizar **avisos de trabajo** como lo haría un ATS (sistema de seguimiento de candidatos) y medir el **match** entre un aviso y tu CV.

**App:** https://luchorcompartidos.github.io/jobpost/

## Qué hace

- **Aviso:** se usa por separado, sin CV. Detecta palabras clave y las clasifica en excluyentes, requisitos, responsabilidades y deseables, según los títulos de sección y marcas como "excluyente", "deseable", "plus" o "nice to have". También extrae seniority, años de experiencia, modalidad, jornada, contratación, idiomas con nivel, educación, remuneración y beneficios. Marca los términos en inglés y los que el aviso repite sin estar en el diccionario, y da recomendaciones para el CV.
- **Match CV:** pegás el texto de tu CV y la app calcula un puntaje ponderado:
  - **Pesos por prioridad:** excluyente ×3, requisito ×2,5, responsabilidad ×1,5, deseable ×1.
  - **Estado de cada término:** exacto, sinónimo (vale 75%) o falta.
  - **Revisión de requisitos:** años estimados por las fechas, idiomas, educación y título del puesto.
  - **Formato apto ATS:** checklist de contacto, secciones estándar, fechas y largo.
  - **Sugerencias:** qué agregar o ajustar.
- **Importar CV (v0.0.2):**
  - **PDF:** se lee con pdf.js, que se descarga una vez desde un CDN. Detecta si el PDF está escaneado, si sale con caracteres raros, si tiene dos columnas (en ese caso reordena el texto) y cuántas páginas e imágenes tiene.
  - **Word .docx:** se lee con un lector propio, sin librerías. Detecta tablas, cuadros de texto, columnas, imágenes y datos de contacto que estén solo en el encabezado o el pie de página.
  - **.txt.**
  - **JSON:** acepta la exportación de CVAPP (`editor-cv-argentina`, respeta las secciones ocultas y no usa el CUIL ni la fecha de nacimiento), JSON Resume o cualquier otro JSON, del que toma todos los textos.
  - **Documento de Google:** se lee directo si es público o está publicado en la web. Si no, explica cómo descargarlo como .docx.
  - **No soportados:** el .doc viejo y los PDF escaneados. La app explica cómo convertirlos.
- **Historial:** cada aviso analizado se guarda con su resultado y su match.
- **Diccionario:** unos 160 términos base en español e inglés, con sinónimos y categorías. Podés sumar términos propios.
- **Datos:** todo queda en el navegador. Desde el menú ⋯ se exporta e importa el backup `.json`, se exporta el historial a CSV y se imprime o guarda en PDF.

El motor local por reglas funciona sin conexión.

## IA (v0.0.3) <a id="ia"></a>

La IA es opcional y complementa al motor local:

- **Analizar con IA:** resume el puesto, marca alertas y da consejos. Además encuentra términos y sinónimos que el diccionario no conoce y los propone como **reglas sugeridas**. Vos elegís cuáles sumar al motor local.
- **Comparar con IA:** da un puntaje de la IA junto al del motor local, con fortalezas, brechas, sugerencias por sección y palabras clave para sumar. Nunca inventa experiencia. La primera vez pide confirmación para enviar el CV.
- **Reglas propias con versión:** cada cambio (agregar, borrar, aprobar desde la IA, importar) crea una versión nueva. Desde **Diccionario → Versiones** se puede volver a cualquiera de las últimas 30. Las reglas se exportan e importan en `.json` (`tipo: "reglas"`).
- **Resultados guardados:** quedan en el historial de cada aviso, así que no hace falta volver a consultar.

### Conexión recomendada: Apps Script propio

La clave queda en tu cuenta de Google, nunca en el navegador. Sirve desde cualquier dispositivo y tiene un límite diario de consultas.

1. Entrá a [script.google.com](https://script.google.com) → **Nuevo proyecto** y pegá el contenido de [`apps-script/Codigo.gs`](apps-script/Codigo.gs).
2. En **Configuración del proyecto ⚙️ → Propiedades del script**, agregá:
   - `PROVEEDOR`: `gemini` (tiene plan gratuito, clave en [aistudio.google.com](https://aistudio.google.com)) o `claude` (pago por uso, clave en [console.anthropic.com](https://console.anthropic.com)).
   - `CLAVE_API`: tu clave.
   - `TOKEN`: generalo en la app, en **⋯ → Configurar IA → Generar**.
   - Opcionales: `MODELO` (por defecto `gemini-flash-latest` o `claude-haiku-5-5`) y `LIMITE_DIARIO` (por defecto 100).
3. Tocá **Implementar → Nueva implementación → Aplicación web**, con *Ejecutar como: Yo* y *Quién tiene acceso: Cualquier usuario*. Autorizá y copiá la URL que termina en `/exec`.
4. En la app, entrá a **⋯ → Configurar IA**, pegá la URL y el token, y tocá **Probar**.

Si cambiás el código del script, implementá una **nueva versión** en *Implementar → Gestionar implementaciones*. Así la URL sigue siendo la misma.

### Alternativa: clave en este navegador

Se elige Gemini o Claude y se pega la clave. Es más rápido, pero la clave queda guardada en ese navegador y hay que cargarla en cada dispositivo. En ningún caso la configuración de IA se incluye en el backup.

> **Privacidad:** la IA recibe el aviso y, en el match, también tu CV. Según las condiciones de Google, en el plan gratuito de Gemini los datos pueden usarse para mejorar sus productos. Revisá las condiciones vigentes.

## Tema

Por defecto sigue el tema del sistema (claro u oscuro). Se puede fijar en **⋯ → Tema**. Al imprimir siempre sale en claro.

## Próximas fases

1. **Fase 2 (hecha en v0.0.2):** importar el CV. Pendiente a futuro: un botón "Enviar a Job Post" en CVAPP y OCR para PDF escaneados.
2. **Fase 3 (hecha en v0.0.3):** motor con IA, reglas aprobadas con versión e importación y exportación de reglas, además del tema de sistema.
3. **Fase 4:** sumar la app a Mi Panel y a la caja de apps, más extras:
   - seguimiento de postulaciones;
   - resaltar en el CV las palabras clave del aviso;
   - tendencias de skills en los avisos analizados;
   - borrador de carta de presentación.

## Formato del backup JSON

```json
{ "app": "jobpost", "tipo": "backup", "formato": 1, "version": "v0.0.1", "motor": "reglas-1",
  "exportado": "…", "data": { "aviso": {}, "cv": "", "history": [], "custom": [] } }
```

Al importar se valida el tipo y el formato, se limpian los campos y se controla el largo de cada uno. Nunca se ejecuta nada del archivo. Podés elegir entre **combinar** con tus datos o **reemplazarlos**. El backup incluye tu CV, así que guardalo en un lugar privado.

## Versiones

Sigue el estándar de la caja de apps (ver `luchorcompartidos/home` → `ESTANDAR-VERSIONES.md`):

- El número va en `<meta name="app-version">`.
- El tipo de Release se indica en el commit con `[major]`, `[minor]`, `[patch]` o `[skip release]`.
