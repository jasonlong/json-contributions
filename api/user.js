const cheerio = require('cheerio');
const got = require('got');

export default (req, res) => {
  let GH_DOMAIN = 'https://github.com'
  let year = "2020"
  if (req.query.year) {
    year = req.query.year
  }
  let contributions = []
  let minCount = 0
  let maxCount = 0

  let url = `${req.query.username}?tab=overview&from=${year}-12-01&to=${year}-12-31`
  got(url, {prefixUrl: GH_DOMAIN}).then(response => {
    const $ = cheerio.load(response.body)
    let weeks = $('.js-yearly-contributions svg > g g')

    weeks.each((i, w) => {
      let week = {}
      week['week'] = i
      week['days'] = []
      $(w).find('rect').each((j, r) => {
        let day = {}
        day['date'] = $(r).data('date')
        day['count'] = $(r).data('count')
        week['days'].push(day)

        if ($(r).data('count') <= minCount) {
          minCount = $(r).data('count')
        }
        if ($(r).data('count') > maxCount) {
          maxCount = $(r).data('count')
        }
      })
      contributions.push(week)
    })

    res.json({
      username: req.query.username,
      year: year,
      min: minCount,
      max: maxCount,
      contributions: contributions
    })
  }).catch(err => {
    // TODO: something better
    console.log(err)
  })
}
