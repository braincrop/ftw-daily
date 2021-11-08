const { getIntegrationSdk } = require('../api-util/sdk');

module.exports = (req, res) => {
  const SDK = getIntegrationSdk();

  const { listingId } = req.body;

  SDK.transactions.query({
        listId: listingId,
    })
    .then(response => {
      return res.status(response.status).send(response.data);
    })
    .catch(e => {
      return res.status(500).send('API error');
    });
}
