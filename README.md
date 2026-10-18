# Sport TV

Lecteur de séances du matin, en HTML/CSS/JavaScript, sans dépendance et sans compte utilisateur. Première version à tester sur ordinateur avant la connexion à la télévision.

## Démarrer

Depuis ce dossier : `python3 -m http.server 8080`. Ouvrir `http://localhost:8080` dans le navigateur. Ne pas ouvrir index.html directement : le programme est chargé par HTTP.

Choisir une séance, 20/25/30 minutes, une difficulté (Facile, Normale, Soutenue), la forme, l'état du genou et une éventuelle course dans les dernières 24 heures. La durée inclut 4 minutes d'échauffement et 3 minutes de retour au calme. Les étapes centrales contiennent préparation, effort et récupération. Les répétitions sont une cible facultative : arrêter le mouvement avant la fin du créneau si la technique se dégrade. Les haltères ne sont pas obligatoires sur chaque exercice.

Commandes : pause/reprendre, passer, variante facile, arrêter, plein écran. Les sons sont activés au clic de démarrage si le navigateur le permet. Après une interruption de plus de 5 secondes, la lecture se met en pause plutôt que de sauter des exercices.

## Réglages par l'adresse

Le lecteur peut s'ouvrir déjà réglé, avec des paramètres dans l'adresse :

`https://tibtibus.github.io/sport-tv/?seance=renforcement-a&difficulte=normale&duree=25&forme=bonne&genou=ok&course=non`

| Paramètre | Valeurs acceptées |
|---|---|
| `seance` | renforcement-a, renforcement-b, cardio, cardio-tronc, recuperation |
| `difficulte` | facile, normale, soutenue |
| `jour` (ancien lien) | compatible ; traduit en séance, dimanche ouvre Renforcement A |
| `duree` | 20, 25 ou 30 |
| `forme` | bonne, moyenne, fatigue |
| `genou` | ok, gene, douleur |
| `course` | oui, non |

- Un paramètre absent garde la valeur par défaut (Renforcement A et difficulté Normale). Le jour courant ne choisit jamais la séance. Les réglages d'une séance précédente ne sont pas repris : ils viennent de l'adresse ou des valeurs par défaut.
- Les règles de sécurité sont inchangées : genou « douleur » bloque le démarrage, gêne ou fatigue donnent la séance douce, une course récente donne la séance haut du corps.
- Une valeur non reconnue affiche une erreur et bloque le démarrage jusqu'à correction.
- La ligne « Réglages reçus par l'adresse » affiche à l'écran les réglages réellement appliqués, pour les vérifier.
- Le clic sur « Commencer » reste nécessaire : le navigateur n'autorise le son qu'après un geste.

## Travail avec Hermès

Lire AGENTS.md et HERMES.md. Hermès modifie `data/program.json` pour préparer les séances ; le lecteur charge ce fichier à son ouverture. Les bilans se téléchargent en JSON et doivent être transmis à Hermès. Le lecteur ne synchronise pas automatiquement les bilans et n'exécute pas de tâche planifiée.

## Vérifier

`node scripts/check.mjs` : validité du programme, durée exacte, adaptations, gestion de la douleur et lecture des réglages par l'adresse.

## Suite prévue

- Commande synchronisée depuis le téléphone (nécessite un service partagé).
- Lancement sur la TCL après identification du modèle.
- Planification matinale sur l'ordinateur d'Hermès et publication selon l'hébergement choisi.

Ces fonctions ne sont pas présentes dans cette première version. Un dépôt privé ne rend pas automatiquement un site publié privé. Ne pas publier les bilans ni des renseignements médicaux.

## Démonstrations des gestes

Les onze mouvements du programme disposent d'une vidéo de référence. L'échauffement et le retour au calme proposent aussi des vidéos pour leurs gestes (marche, épaules, hanches ou chevilles). Les boutons permettent de choisir le geste à observer ; ces clips ne constituent pas une routine complète de quatre ou trois minutes. La récupération n'a pas de vidéo.

Avant la séance, les boutons « Voir » ouvrent un aperçu. Pendant la séance, une vidéo muette accompagne les consignes en français. La préparation affiche « Prépare-toi — ne commence pas encore les répétitions » et le temps avant le départ ; l'effort affiche « À toi de jouer ». Les dix secondes de préparation et les quarante secondes de mouvement sont deux phases du même exercice. Les durées sont conservées.

« Observer le geste — pause » et le choix d'un autre geste suspendent le minuteur et laissent la vidéo jouer. « Reprendre » relance la séance. Le temps d'observation s'ajoute seulement si l'utilisateur le demande.

Les vidéos sont intégrées avec les lecteurs officiels YouTube et Vimeo, sans téléchargement ni copie dans le dépôt. Certains tutoriels sont en anglais et la boucle porte sur la vidéo originale entière. Des restrictions, annonces ou blocages de lecture restent possibles. Les liens et les consignes restent disponibles si une vidéo ne charge pas. Vérifier la lecture réelle dans le Chrome d'Hermès et en Cast.

La variante facile affiche ses consignes et retire la vidéo de référence pour ne pas montrer un geste différent. Les vidéos couvrent les mouvements de référence, pas toutes les adaptations. Une démonstration ne corrige pas la posture de l'utilisateur.

Le tirage est maintenant explicité avec appui sur un support fixe et stable, pour correspondre au tutoriel. Les autres exercices, l'ordre, les durées, les réglages par adresse et les identifiants des commandes d'Hermès sont conservés.

### Sources des vidéos

- Squat et pont à deux jambes : [Kingston and Richmond NHS, physiothérapie](https://www.kingstonandrichmond.nhs.uk/services/service-search-z/physiotherapy-msk-richmond), vidéos liées directement par le service.
- Pompes au mur : [South Tees Hospitals NHS](https://www.southtees.nhs.uk/resources/combined-press-ups/), vidéo liée par le service.
- Tirage avec haltère : [Michelle Kenway, physiothérapeute](https://www.pelvicexercises.com.au/dumbbell-row/), lecteur et lien de la publication de l'auteure.
- Hanches en arrière : [Hinge Health](https://www.hingehealth.com/fr/fr/resources/articles/hip-hinge/), vidéo du compte Hinge Health et guide relu par un physiothérapeute.

- Glissement du pied à quatre pattes : [Body Works Sports Physiotherapy](https://body-works.ca/physio-video/core-strength-four-point-kneeling-with-heel-slides/).
- Flexion des coudes avec haltères : [Hawkes Physiotherapy](https://hawkesphysiotherapy.co.uk/exercise/dumbbell-bicep-curls-in-supination/).
- Marche sur place : [Lancashire Teaching Hospitals NHS](https://www.lancsteachinghospitals.nhs.uk/trauma-exercises), « HIP Marching on spot ».
- Pas latéraux : [Peak Physio](https://www.peak-physio.com.au/exercise/side-stepping/), sans obstacle ni élastique.
- Cercles d'épaules : [National University Health System, Singapour](https://www.youtube.com/watch?v=Bv8QPOs7xks).
- Rapprochement des omoplates : [Restore Plus Physical Therapy](https://www.youtube.com/watch?v=_TI_RXSAyfU).
- Pointes et talons assis : [Arthritis Foundation — Walk With Ease](https://www.youtube.com/watch?v=JegXz_XPgwk).

Sélection des sources : 3 octobre 2026. Le catalogue est data/demos.json ; ne pas y ajouter des vidéos dont la variante ne correspond pas à l'exercice. Ne pas remplacer les vidéos par des gestes générés par IA. Les auteurs conservent leurs droits : aucune autorisation de réhéberger ces fichiers n'est supposée.

## Affichage télévision et Cast

Pendant la séance, les écrans paysage d'au moins 900 × 600 pixels utilisent une mise en page compacte ajustée à la hauteur disponible. Le minuteur, le geste, les consignes et les commandes restent dans la même vue. Les écrans étroits conservent l'affichage vertical.

Le bouton « Plein écran » agrandit toute la page Sport TV. Le plein écran des vidéos intégrées est désactivé ; Vimeo masque aussi ses boutons Chromecast, AirPlay et Picture-in-Picture. Les iframes interdisent la présentation et la lecture distante de la vidéo seule. Hermès doit continuer à caster l'onglet Sport TV depuis Chrome. Vérifier le comportement réel sur la télévision : l'application ne contrôle pas les optimisations ni les réglages du récepteur Cast.

## YouTube Premium

Le lecteur YouTube utilise désormais `www.youtube.com` pour permettre la reconnaissance d'une session YouTube Premium dans le même profil Chrome. Cela remplace le mode de confidentialité avancé `youtube-nocookie.com` : YouTube peut utiliser les cookies et associer les lectures au compte connecté. L'application ne récupère ni identifiant ni abonnement. Les annonces restent possibles si YouTube ne reconnaît pas la session ou si le navigateur bloque les cookies nécessaires ; aucune absence de publicité n'est garantie. Tester dans le profil dédié d'Hermès déjà connecté à YouTube Premium. Les réglages d'affichage intégré et le lecteur Vimeo sont conservés.

## Thèmes clair et sombre

Le thème 1 sombre est affiché par défaut : vidéo à gauche, chronomètre et consignes à droite. Le thème 2 clair utilise trois colonnes sur les grands écrans : chronomètre, vidéo, consignes. Le bouton soleil/lune en haut permet de passer de l'un à l'autre, y compris pendant la séance, sans relancer le lecteur ni le chronomètre. Le choix est conservé dans le stockage local de ce profil Chrome ; si ce stockage est indisponible, le bouton continue de fonctionner pour la page ouverte.

Sur écran tactile, un glissement horizontal sur le texte ou une zone libre du contenu change de thème (gauche vers clair, droite vers sombre). Les gestes sur les vidéos, liens, sélecteurs et boutons sont laissés à ces contrôles. Le thème du téléphone et celui du Chrome d'Hermès restent indépendants. Les écrans étroits conservent un défilement vertical pour garder les consignes lisibles. Les écrans paysage utilisent une présentation ajustée à leur hauteur, avec une répartition adaptée sur les écrans moins hauts.

## Accueil compact

Sur ordinateur ou télévision en paysage (au moins 900 × 600 pixels), l’accueil répartit les réglages en haut, la séance et les démonstrations côte à côte, et les exercices dans un bandeau inférieur. La liste des exercices est directement visible. Les réglages et les identifiants des commandes utilisés par Hermès sont conservés. Les écrans étroits gardent un défilement vertical pour conserver la lisibilité.



## Circuit gainage et chaise

Les séances Renforcement A et B, choisies librement quel que soit le jour, en forme bonne ou moyenne, sans gêne ni course signalée, intègrent trois passages du circuit : gainage face au sol sur les coudes 45 s, côté gauche 30 s, côté droit 30 s, gainage dynamique sur les coudes 45 s, chaise au mur 45 s. Chaque exercice est précédé de 10 s de préparation et suivi de 15 s de récupération. Les autres exercices occupent le temps restant, répartis entre les passages.

Le circuit seul représente 9 min 45 s d’effort et 16 minutes avec préparation et repos. Avec les 7 minutes d’échauffement/retour au calme, il nécessite plus de 20 minutes : choisir 25 ou 30 minutes. Le mode 20 minutes bloque explicitement le démarrage de ce circuit et invite à choisir une durée suffisante ; aucune durée n’est allongée en silence. Les séances douces, le blocage en cas de douleur et les adaptations après course sont conservés, sans ajout automatique du circuit. Les réglages de bonne/moyenne forme ne raccourcissent pas les durées propres du circuit. Le bouton Plus facile, Pause et Passer restent disponibles.

Les passages et le côté d’appui sont affichés pendant les exercices. Avant le départ, chaque mouvement du circuit affiche sa durée et ses trois répétitions. Les maintiens statiques disposent d’une consigne spécifique de maintien, plutôt que de répétitions.

### Démonstrations ajoutées

- Gainage sur les avant-bras : [Peak Physio](https://www.peak-physio.com.au/exercise/plank-forearms/), vidéo officielle liée par le cabinet, `o5QMoXuoZs4`.
- Chaise : [Peak Physio](https://www.peak-physio.com.au/exercise/deep-wall-squat/), vidéo officielle liée par le cabinet, `ImNN11vubVU`. La profondeur du modèle ne constitue pas une cible obligatoire.
- Gainage latéral : schémas SVG originaux, repères vérifiés avec [Holistic Physio Fitness](https://holisticphysiofitness.com.au/exercise/side-plank-isometric-hold/). La même posture est montrée avec le côté d’appui explicitement nommé ; pas de copie d’une photo du cabinet.
- Gainage dynamique : schéma SVG original en deux étapes, appui sur les coudes et alternance des genoux. Repères : [Life Time — Experience Life, section Mountain Climber on Forearms](https://experiencelife.lifetime.life/article/break-it-down-the-mountain-climber/). Le genou avance sans exiger de contact avec la poitrine ; aucune vidéo bras tendus ou avec rotation ne remplace cette variante.

Sources consultées le 18 octobre 2026. Les SVG sont des rappels simplifiés du geste, pas une validation individuelle de posture. Aucune image générée ni fichier vidéo tiers n’est réhébergé. Le lecteur conserve les paramètres de lecture intégrée, les liens de source et le fonctionnement YouTube Premium existants. La lecture réelle des nouveaux clips sur la télévision reste à vérifier.

Vérification du lecteur : `node scripts/player-check.mjs` teste les commandes et les durées avec un DOM et des lecteurs vidéo simulés ; ce contrôle ne remplace pas la vérification visuelle sur télévision.


## Navigation à la télécommande

Sur une télévision, ouvrir `https://tibtibus.github.io/sport-tv/?tv=1` pour forcer le mode TV. Le bouton « Mode TV » permet aussi de l’activer ou le désactiver ; ce choix est conservé sur cet appareil si le navigateur autorise le stockage local. `?tv=0` force le mode classique. Les navigateurs identifiables comme Smart TV, Android TV, Tizen ou webOS activent le mode automatiquement, mais certains se présentent comme Chrome : la détection n’est donc pas garantie, et la taille de l’écran seule n’est pas utilisée.

- Flèches : déplacer la sélection visible entre les commandes.
- OK : ouvrir un réglage, puis valider l’option choisie avec les flèches.
- Retour / Échap : fermer le choix sans modifier la valeur, ou fermer une démonstration. Hors de ces fenêtres, Retour conserve son rôle dans le navigateur.
- Pendant la séance, les flèches naviguent entre les boutons ; seul OK sur « Passer » passe un exercice.

Les menus TV remplacent uniquement l’affichage des listes : les valeurs, adaptations et blocages du lecteur restent gérés par les réglages existants. La télécommande doit transmettre les touches au site (certains navigateurs ont un mode pointeur à désactiver). Vérifier le comportement réel dans le navigateur installé sur la télévision ; aucune commande à distance ou connexion à la TV n’est ajoutée.


## Séances libres et difficulté

Aucun jour n’est affiché ou utilisé pour imposer une séance ou un repos. Le choix « Séance » propose Renforcement A, Renforcement B, Cardio sans sauts, Cardio et tronc et Récupération active. Le format historique `days` du programme reste inchangé pour les agents, mais sert uniquement de catalogue ; le calendrier ne limite plus le lecteur.

Pour les exercices courants, un cycle garde 10 s de préparation et dure 60 s : Facile = 30 s d’effort / 20 s de repos (avec consignes de variante facile), Normale = 35 s / 15 s, Soutenue = 40 s / 10 s. La forme moyenne limite l’effort à 30 s ; fatigue ou gêne conservent la séance douce de 30 s. Les trois passages du circuit gardent toujours 45/30/30/45/45 s d’effort et 15 s de repos, quelle que soit la difficulté. La durée totale choisie reste exacte. Les démonstrations de référence sont retirées lorsque la variante facile est affichée, comme pour le bouton « Plus facile ».


## Mode TV paysage — Équilibre

Le mode TV en paysage utilise une feuille dédiée `tv-layout.css`, y compris sur les navigateurs dont la hauteur CSS est inférieure à 600 px. La hauteur disponible est actualisée lors du redimensionnement et des changements de barre du navigateur. La vidéo ou le schéma reste à gauche, le minuteur et la consigne principale à droite, et les quatre commandes en bas. L’accueil garde aussi ses réglages en ligne.

Les thèmes clair et sombre gardent cette même répartition en mode TV. Hors mode TV, le thème clair retrouve sa répartition sur ordinateur. Les liens de source et les explications complémentaires restent dans l’aperçu « Apprendre les gestes » ; pendant la séance TV, la consigne principale est affichée sans répéter toute la fiche du tutoriel. Le cadre vidéo n’ouvre pas le plein écran du média. Les paramètres des lecteurs intégrés sont conservés.

Utiliser `?tv=1` ou le bouton Mode TV si le navigateur de la télévision ne s’identifie pas comme tel. La page ne force pas une rotation physique de l’écran. Recharger le site hors séance après mise à jour.


## Sons et annonces vocales

Le bouton « Son » de l’en-tête ouvre les réglages accessibles à la télécommande : Muet, Bips seuls, Bips + voix, et volume de 0 à 100 % par pas de 25 %. Le choix est conservé localement sur l’appareil. Par défaut : Bips + voix, volume 50 %. « Tester le son » permet de vérifier avant de commencer. Le son est activé uniquement après un geste sur Commencer, Reprendre ou Tester.

Trois bips distincts sont joués aux trois dernières secondes de préparation avant l’effort ; les signaux de départ et de récupération sont différents. Les annonces françaises restent courtes : préparation du mouvement, départ de l’effort, repos, nouveau passage, retour au calme et fin. Les durées du programme restent inchangées.

Les bips sont synthétisés avec Web Audio. La voix principale est un enregistrement français ElevenLabs (Marc Aurèle, modèle eleven_multilingual_v2), généré via HeyGen le 18 octobre 2026. Les 27 annonces sont regroupées dans assets/coach-fr.mp3 et découpées à la lecture selon coach.mjs. Aucun appel à une API vocale ni clé secrète n’est nécessaire pendant les séances. Le fichier est préchargé ; un échec de téléchargement ou de décodage utilise la voix française du navigateur, puis les bips si aucune voix n’est disponible. Sans Web Audio, la voix système reste utilisable si disponible ; les consignes visuelles restent fonctionnelles. La disponibilité et le rendu audio doivent être essayés sur le navigateur de la TV réelle ; les contrôles automatisés ne constituent pas une écoute physique.

Pause, Arrêter, fermeture du test sonore et changement de réglage coupent les sons en cours. Ouvrir les réglages pendant une séance la met en pause ; la reprise reste manuelle. Quitter l’onglet met également la séance en pause. Il n’y a pas d’annonce relancée par un changement de thème, ni de rattrapage d’anciens bips.

Vérification : `node scripts/coach-check.mjs`, `node scripts/audio-check.mjs` et `node scripts/player-check.mjs`.
