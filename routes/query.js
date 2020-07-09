const router = require("express").Router();
const request = require("request");
let routesArr = [];

function redirectToHome() {
  return res.redirect("/");
}

function validateInput(query) {
  if (Object.keys(query).length === 0 && query.constructor === Object)
    redirectToHome();

  for (const key in query) {
    if (key !== "src" && key !== "dst")
      redirectToHome();
  }

  if (
    Array.isArray(query["src"]) ||
    typeof query["src"] === "undefined" ||
    typeof query["dst"] === "undefined"
  )
    redirectToHome();

  const arrSrc = query["src"].split(",");

  if (arrSrc.length === 1)
    redirectToHome();

  const srcLat = parseFloat(arrSrc[0]);
  const srcLon = parseFloat(arrSrc[1]);

  if (isNaN(srcLat) || isNaN(srcLon))
    redirectToHome();

  const { dst } = query;

  for(const key in dst ){
    let arrDst = dst[key].split(',')

    if (arrDst.length === 1)
      redirectToHome();

    let dstLat = parseFloat(arrDst[0]);
    let dstLon = parseFloat(arrDst[1]);
    if (isNaN(dstLat) || isNaN(dstLon))
      redirectToHome();
  }
}

router.get("/", (req, res) => {
  validateInput(req.query);

  const { src, dst } = req.query;

  for (const key in dst) {
    let urlString =
      "http://router.project-osrm.org/route/v1/driving/" + src + ";" + dst[key] + "?overview=false";

    request.get({
        url: urlString,
        json: true,
        headers: { "User-Agent": "request" },
      },
      (err, response, responseAPI) => {
        if (err) {
          console.error("ERROR: ", err);
          throw err
        } else if (response.statusCode !== 200) {
          console.error("Status: ", response.statusCode);
          throw "Status: ", response.statusCode
        } else {
          routesArr.push({
            destination: dst[key],
            duration: responseAPI["routes"][0]["duration"],
            distance: responseAPI["routes"][0]["distance"],
          });
        }
      }
    );
  }

  // provides unique values
  routesArr =
    Array
    .from(new Set(routesArr.map((a) => a.destination)))
    .map((destination) => {
      return routesArr.find((a) => a.destination === destination);
    });

  routesArr.sort((objA, objB) => {
    if (objA["duration"] < objB["duration"]) {
      return -1;
    } else if (objA["duration"] > objB["duration"]) {
      return 1;
    } else if (objA["distance"] < objB["distance"]) {
      return -1;
    } else if (objA["distance"] > objB["distance"]) {
      return 1;
    }

    return 0;
  });

  res.status(200).json({
    source: src,
    routes: routesArr,
  });
});

module.exports = router;
