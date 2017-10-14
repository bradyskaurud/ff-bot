const dateDiffIndays = function(date1, date2) {
  dt1 = new Date(date1);
  dt2 = new Date(date2);
  return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
}

const start = '09/07/2017';

module.exports = {
  getCurrentWeek: function() {
    return Math.floor(dateDiffIndays(start, new Date()) / 7)
  },
}