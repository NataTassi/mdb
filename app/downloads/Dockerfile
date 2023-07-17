FROM ubuntu:latest as development
RUN apt update
RUN apt install transmission-daemon curl python3 python3-pip -y
COPY scripts/get_nodejs.sh ./
SHELL ["/bin/bash", "-i", "-c"]
RUN chmod +x get_nodejs.sh && ./get_nodejs.sh && rm get_nodejs.sh
WORKDIR /app
COPY web/package.json web/package-lock.json* ./
RUN npm install
COPY scripts/requirements.txt ./
RUN pip3 install -r requirements.txt
EXPOSE 8080 9091
ENV TRANSMISSION_USER=${TRANSMISSION_USER}
ENV TRANSMISSION_PASS=${TRANSMISSION_PASS}
ENV TMDB_API_KEY=${TMDB_API_KEY}
ENV OPENSUBTITLES_KEY=${OPENSUBTITLES_KEY}
ENV OPENSUBTITLES_USER=${OPENSUBTITLES_USER}
ENV OPENSUBTITLES_PASS=${OPENSUBTITLES_PASS}
CMD chmod -R +x /app/scripts && /app/scripts/start.sh