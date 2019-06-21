FROM ety001/node:10.15.3
COPY . /app
EXPOSE 8899
RUN npm install
CMD ["npm", "run", "start"]
