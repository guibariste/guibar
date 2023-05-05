
export function Graphxp(xp) {
    // Définir les dimensions du graphique
    const xpDiv = document.getElementById('xp');
    let ouvert =false
    let modal;
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const xpTitle = document.createElement('h2');
    xpTitle.textContent = 'Evolution xp 2022-2023';
    
  
    
    xpDiv.appendChild(xpTitle);
    // Ajouter une propriété cumulative pour les valeurs d'amount
    xp.forEach((d, i) => {
        d.cumulativeAmount = i > 0 ? d.amount + xp[i-1].cumulativeAmount : d.amount;
    });

    // Créer un conteneur SVG pour le graphique
    const svg = d3.select("#xp")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Créer l'échelle X pour les dates
    const xScale = d3.scaleTime()
      .domain(d3.extent(xp, d => new Date(d.createdAt)))
      .range([margin.left, width - margin.right]);

    // Créer l'échelle Y pour les grades
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(xp, d => d.cumulativeAmount)])
      .range([height - margin.bottom, margin.top]);

    // Créer les axes X et Y
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Ajouter les axes X et Y au graphique
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis);
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    // Créer la ligne pour les grades
    const line = d3.line()
      .x(d => xScale(new Date(d.createdAt)))
      .y(d => yScale(d.cumulativeAmount));

    // Ajouter la ligne au graphique
    svg.append("path")
      .datum(xp)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("d", line);
      const circles = svg.selectAll("circle")
      .data(xp)
      .join("circle")
      .attr("cx", d => xScale(new Date(d.createdAt)))
      .attr("cy", (d, i) => {
        // Calculer la somme cumulée des amounts jusqu'à l'indice i
        const cumulativeAmount = xp.slice(0, i + 1).reduce((acc, cur) => acc + cur.amount, 0);
        return yScale(cumulativeAmount);
      })
      .attr("r", 4)
      .attr("fill", "red")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
     if (ouvert==false){
      ouvert=true
        // Afficher une fenêtre modale avec les informations sur le point sélectionné
         modal = document.createElement("div");
        modal.classList.add("modal");
        modal.innerHTML = `
          <div class="modal-content">
            <p>Date : ${d.createdAt}</p>
            <p>XP : ${d.amount}</p>
            <p>Nom du projet : ${d.object.name}</p>
            <p>Total : ${getEvolution(xp, d)}</p>
    
            <button id="close-modal">Fermer</button>
          </div>
        `;
        document.body.appendChild(modal);
     }
        // Ajouter un gestionnaire d'événements pour fermer la fenêtre modale lorsque le bouton "Fermer" est cliqué
        const closeModalButton = document.querySelector("#close-modal");
        closeModalButton.addEventListener("click", () => {
          document.body.removeChild(modal);
          ouvert=false

        
        });
      
      });
}
    // Fonction pour calculer l'évolution jusqu'à un point donné
    function getEvolution(data, point) {
      // Trouver l'indice du point dans le tableau
      const index = data.findIndex(d => d.createdAt === point.createdAt);
    
      // Si le point est le premier dans le tableau, l'évolution est 0
      if (index === 0) {
        return 0;
      }
    
      // Calculer la somme cumulée des amounts jusqu'à l'indice précédent
      const cumulativeAmount = data.slice(0, index).reduce((acc, cur) => acc + cur.amount, 0);
    
      // Calculer l'évolution entre le point précédent et le point actuel
      const previousAmount = data[index - 1].amount;
      const currentAmount = point.amount + cumulativeAmount;
      const evolution = currentAmount - previousAmount;
    
      return evolution;
    }
    