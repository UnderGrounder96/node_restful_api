const router = require("express").Router(),
  request = require("request");

function redirectToHome() {
  return res.redirect("/");
}

function validateInput(query) {
  if (Object.keys(query).length === 0 && query.constructor === Object)
    redirectToHome();

  for (const key in query) {
    if (key !== "src" && key !== "dst") redirectToHome();
  }

  if (
    Array.isArray(query["src"]) ||
    typeof query["src"] === "undefined" ||
    typeof query["dst"] === "undefined"
  )
    redirectToHome();

  let arrSrc = query["src"].split(","),
    srcLat = parseFloat(arrSrc[0]),
    srcLon = parseFloat(arrSrc[1]);

  if (isNaN(srcLat) || isNaN(srcLon)) redirectToHome();

  //TODO: Implement the above check for all dst
}

function restfulAPI(urlString){
  return new Promise(function(resolve, reject) {
    request.get(
    {
      url:urlString,
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
        resolve(responseAPI)
        // res.cookie("distance"+key, responseAPI["routes"][0]["distance"], cookieOptions)
        // data is already parsed as JSON:
        // console.log("Got data: \n");
        // console.log(responseAPI)

        // duration = parseFloat(responseAPI["routes"][0]["duration"]);
        // distance = parseFloat(responseAPI["routes"][0]["distance"]);
        // console.log(responseAPI["routes"][0]["duration"])
        // console.log(duration);
      }
    });
  });
}

router.get("/", (req, res) => {
  validateInput(req.query);
  let duration, distance;
  const routes = [],
    { src, dst } = req.query;

  for (const key in dst) {
    responseAPI = restfulAPI("http://router.project-osrm.org/route/v1/driving/" +
    src +
    ";" +
    dst[key] +
    "?overview=false")
    // .then((responseAPI) => {
    //   duration = parseFloat(responseAPI["routes"][0]["duration"]);
    //   distance = parseFloat(responseAPI["routes"][0]["distance"]);
    //   console.log(duration)
    // })
    console.log(responseAPI)

    // routes.push({
    //   destination: dst[key],
    //   duration: duration,
    //   distance: distance,
    // });
  }

  routes.sort((objA, objB) => {
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

  //TODO: Check code OK
  //TODO: sort from mobile array and objects : Developer.Mozilla "array sort"
  //TODO: get the API from the bois and do multi bs

  // console.log("src: "+ typeof src);

  // console.log(req.query)
  res.status(200).json({
    source: src,
    routes: routes,
  });
});

module.exports = router;
