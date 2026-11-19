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

## Próximas fases

1. **Fase 2 (hecha en v0.0.2):** importar el CV. Pendiente a futuro: un botón "Enviar a Job Post" en CVAPP y OCR para PDF escaneados.
2. **Fase 3:** motor con IA, idealmente con un intermediario en Apps Script para no exponer la clave de API. Las reglas nuevas que sugiera la IA se aprueban antes de sumarse a la base local, que es acumulativa y tiene versión. Se van a poder importar y exportar paquetes de reglas en JSON.
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
