# SolrSearch
Sacramento County Solr Search UI. Designed for use with Lucidworks Fusion.

## Requires Nodejs > 4.2.2 recommended.

### Install grunt-cli globally
```
npm install -g grunt-cli
```

### Install grunt and bower packages
```
git clone https://github.com/SacCounty/SolrSearch
cd SolrSearch
npm install
```
  
### WCF Service
* Build project
* From project properties **Web Tab** click **Create Virtual Directory**

### Auth
For local development, add proper host, username, and password keys to your
environment variables with the following powershell or bash. Ie:

Windows
```ps
[Environment]::SetEnvironmentVariable("SolrHost", "solr.server.name", "User")
[Environment]::SetEnvironmentVariable("SolrUsername", "solr.User", "User")
[Environment]::SetEnvironmentVariable("SolrPassword", "solr.Password", "User")
```

*nix
```bash
export SolrHost=solr.server.name
export SolrUsername=solr.User
export SolrPassword=solr.Password

# make them permanent with
echo export SolrHost=solr.server.name >> .bash_profile
echo export SolrUsername=solr.User >> .bash_profile
echo export SolrPassword=solr.Password >> .bash_profile
```

### Grunt Tasks
```
grunt default
```

will jshint and execute unit tests  

```
grunt build
```

will do everything in default, but will also create a build package for deployment.
