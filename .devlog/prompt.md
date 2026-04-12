###1. Trying to play video via proxy
Now you have the project structure, implement the following feature.
1. Users can specify a mediaflow proxy url & proxy password (optional password if the proxy is not public)
2. These can be specified in env file
3. After the URL is fetched from the provider, the URL is then proxified & whatever video is played is via the proxied URL
4. The URL seems to be being fetched in playes.ts in the functions getMoviePlayers & getTvShowPlayers. You can create a function inside the player.ts file that updates the URL in the source variable.

Documents:
    MediaFlow proxy - https://github.com/mhdzumair/mediaflow-proxy

Make planning for this first.
Then execute the plan.
Generate the changelog once the code changes are done.
Update the @file:.devlog/project-structure-details.md with the updated project strcture.

