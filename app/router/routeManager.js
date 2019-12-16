var routeHome = require('./homeRoutes');
var routeLogin = require('./loginRoutes');
var routeDashboard = require('./dashboardRoutes');

module.exports = function(app){
    
    app.use('/dashboard', routeDashboard);
    app.use('/login', routeLogin);
    app.use('/', routeHome);
    

}