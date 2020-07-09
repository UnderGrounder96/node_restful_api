const router = require("express").Router();
const request = require("request");
let routesArr = [];

function redirectToHome(res) {
  return res.redirect("/");
}

function validateInput(query, res) {
  if (Object.keys(query).length === 0 && query.constructor === Object)
    redirectToHome(res);

  for (const key in query) {
    if (key !== "src" && key !== "dst")
      redirectToHome(res);
  }

  if (
    Array.isArray(query["src"]) ||
    typeof query["src"] === "undefined" ||
    typeof query["dst"] === "undefined"
  )
    redirectToHome(res);

  const arrSrc = query["src"].split(",");

  if (arrSrc.length === 1)
    redirectToHome(res);

  const srcLat = parseFloat(arrSrc[0]);
  const srcLon = parseFloat(arrSrc[1]);

  if (isNaN(srcLat) || isNaN(srcLon))
    redirectToHome(res);

  const { dst } = query;

  for(const key in dst ){
    let arrDst = dst[key].split(',')

    if (arrDst.length === 1)
      redirectToHome(res);

    let dstLat = parseFloat(arrDst[0]);
    let dstLon = parseFloat(arrDst[1]);
    if (isNaN(dstLat) || isNaN(dstLon))
      redirectToHome(res);
  }
}

router.get("/", (req, res) => {
  validateInput(req.query, res);

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

  if (routesArr.length === 0){
    console.error("Routes array is empty!")
    res.send("Please reload the page!");
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
