app.use('/uploads', express.static('uploads'));
app.use('/imagesWanted', express.static(path.join(__dirname, 'imagesWanted')));

// Pour Vercel serverless
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Pour Render/serveurs classiques
  server.listen(port, (err) => {
    if(err) console.log(err.message);
    console.log(`Running on port ${port}`);
  });
}
```

**Commitez.**

Render redéploiera automatiquement et le backend marchera.

---

## ✅ APRÈS

**Ajoutez les variables dans Front + Dashboard Vercel :**
```
REACT_APP_API_URL=https://marli-backend.onrender.com
REACT_APP_URL_BASE_IMAGE=https://marli-backend.onrender.com/bien/images/
app.use('/uploads', express.static('uploads'));
app.use('/imagesWanted', express.static(path.join(__dirname, 'imagesWanted')));

server.listen(port, (err) => {
  if(err) console.log(err.message);
  console.log(`Running on port ${port}`);
});

