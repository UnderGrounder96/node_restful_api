const router = require("express").Router();
const request = require("request");
const arrTmp = [];

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

  let arrSrc = query["src"].split(",");
  let srcLat = parseFloat(arrSrc[0]);
  let srcLon = parseFloat(arrSrc[1]);

  if (isNaN(srcLat) || isNaN(srcLon))
    redirectToHome();

  //TODO: Implement the above check for all dst
}

function getUnique(arr, comp) {
  // store the comparison  values in array
  const unique = arr
    .map((e) => e[comp])

    // store the indexes of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the false indexes & return unique objects
    .filter((e) => arr[e])
    .map((e) => arr[e]);

  return unique;
}

router.get("/", (req, res) => {
  validateInput(req.query);

  const { src, dst } = req.query,
    routes = [];

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
          console.error("ERROR: ");
          console.error(err);
        } else if (response.statusCode !== 200) {
          console.error("Status: ");
          console.error(response.statusCode);
        } else {
          arrTmp.push({
            destination: dst[key],
            duration: responseAPI["routes"][0]["duration"],
            distance: responseAPI["routes"][0]["distance"],
          });
        }
      }
    );
  }

  arr.sort((objA, objB) => {
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

  routes.push(getUnique(arrTmp, "destination"));

  res.status(200).json({
    source: src,
    routes: routes,
  });
});

module.exports = router;
