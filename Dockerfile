FROM ety001/node:10.15.3
COPY . /app
RUN npm install
CMD ["node", "src/index.js"]