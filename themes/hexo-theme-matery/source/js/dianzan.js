function GetUrlRelativePath() {
  var url = document.location.toString();
  var arrUrl = url.split("//");

  var start = arrUrl[1].indexOf("/");
  var relUrl = arrUrl[1].substring(start);

  if (relUrl.indexOf("?") != -1) {
    relUrl = relUrl.split("?")[0];
  }
  return relUrl;
}
$(document).ready(function () {
  AV.init({
    appId: "C3HoPtnONll67fmk2hwP0pTx-MdYXbMMI",
    appKey: "MNLuYWad82S0I9McvB8GoV8e",
    serverURL: "http://api.cbgcdb001.online/",
  });

  const query = new AV.Query("dianzan");
  query.equalTo("href", GetUrlRelativePath());
  query.find().then((data) => {
    if (!data || data.length != 1) {
      document.getElementsByClassName("dianzan")[0].style.color = "#909399";
      document.getElementsByClassName("dianzan")[0].style.display = "block";
      return;
    }
    document.getElementsByClassName("dianzan-count")[0].innerText =
      data[0].attributes.count;
    document.getElementsByClassName("dianzan")[0].style.display = "block";
    const fpPromise = import("https://openfpcdn.io/fingerprintjs/v4").then(
      (FingerprintJS) => FingerprintJS.load()
    );
    fpPromise
      .then((fp) => fp.get())
      .then(({ visitorId }) => {
        if (
          data[0].attributes.users &&
          data[0].attributes.users.indexOf(visitorId) >= 0
        ) {
          document.getElementsByClassName("dianzan")[0].style.color = "#F56C6C";
        } else {
          document.getElementsByClassName("dianzan")[0].style.color = "#909399";
        }
      });
  });
});

const DZ = throttle(() => doDianzan(), 1500);

function dianzan() {
  DZ();
}

function doDianzan() {
  const fpPromise = import("https://openfpcdn.io/fingerprintjs/v4").then(
    (FingerprintJS) => FingerprintJS.load()
  );
  fpPromise
    .then((fp) => fp.get())
    .then((result) => {
      const fingerPrint = result.visitorId;
      const query = new AV.Query("dianzan");
      query.equalTo("href", GetUrlRelativePath());
      query.find().then((data) => {
        if (!data || data.length != 1) {
          const Proto = AV.Object.extend("dianzan");
          const obj = new Proto();
          obj.set("href", GetUrlRelativePath());
          obj.set("count", 1);
          obj.addUnique("users", fingerPrint);
          obj.save();
          document.getElementsByClassName("dianzan-count")[0].innerText = 1;
          document.getElementsByClassName("dianzan")[0].style.color = "#F56C6C";
        } else {
          if (
            data[0].attributes.users &&
            data[0].attributes.users.indexOf(fingerPrint) >= 0
          ) {
            data[0].remove("users", fingerPrint);
            data[0].increment("count", -1);
            document.getElementsByClassName("dianzan")[0].style.color =
              "#909399";
          } else {
            data[0].increment("count", 1);
            data[0].addUnique("users", fingerPrint);
            document.getElementsByClassName("dianzan")[0].style.color =
              "#F56C6C";
          }
          data[0].save();
          document.getElementsByClassName("dianzan-count")[0].innerText =
            data[0].attributes.count;
        }
      });
    });
}

function throttle(fn, delay) {
  let valid = true;
  return function () {
    if (valid) {
      valid = false;
      fn();
      setTimeout(() => {
        valid = true;
      }, delay);
    }
  };
}
