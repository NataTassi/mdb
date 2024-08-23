FROM node:current-alpine
RUN apk update && apk add --no-cache bash curl transmission-daemon transmission-remote transmission-extra python3 py3-pip
WORKDIR /app/scripts
COPY scripts/requirements.txt .
RUN pip install --break-system-packages --no-cache-dir -r requirements.txt
WORKDIR /app/web
COPY web/package.json web/package-lock.json* /app/web/
RUN npm install
EXPOSE 8080 9091
ENV TRANSMISSION_USER=${TRANSMISSION_USER}
ENV TRANSMISSION_PASS=${TRANSMISSION_PASS}
ENV TMDB_API_KEY=${TMDB_API_KEY}
ENV OPENSUBTITLES_KEY=${OPENSUBTITLES_KEY}
ENV OPENSUBTITLES_USER=${OPENSUBTITLES_USER}
ENV OPENSUBTITLES_PASS=${OPENSUBTITLES_PASS}
ENV SCRIPTS_DIR="/app/scripts"
RUN chmod -R +x ${SCRIPTS_DIR}
CMD transmission-daemon --config-dir /app/transmission && npm run start:dev