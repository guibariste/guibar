

export function GraphAudit(audits) {
  const chartDiv = document.getElementById('chart');
  // Définir les dimensions du graphique
  let ouvert =false
  let modal;
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const chartTitle = document.createElement('h2');
  chartTitle.textContent = 'Evolution du ratio 2022-2023';
  chartDiv.appendChild(chartTitle);
  // Créer un conteneur SVG pour le graphique
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Créer l'échelle X pour les dates
  const xScale = d3.scaleTime()
    .domain(d3.extent(audits, d => new Date(d.createdAt)))
    .range([margin.left, width - margin.right]);

  // Créer l'échelle Y pour les grades
  const yScale = d3.scaleLinear()
    .domain([0, 2.5])
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
    .y(d => yScale(d.grade));

  // Ajouter la ligne au graphique
  svg.append("path")
    .datum(audits)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);


  const circles = svg.selectAll("circle")
    .data(audits)
    .join("circle")
    .attr("cx", d => xScale(new Date(d.createdAt)))
    .attr("cy", d => yScale(d.grade))
    .attr("r", 4)
    .attr("fill", "steelblue")
    .attr("cursor", "pointer")
    .on("click", (event, d) => {
      // Afficher une fenêtre modale avec les informations sur le point sélectionné
     if (ouvert == false){
       modal = document.createElement("div");
      modal.classList.add("modal");
      modal.innerHTML = `
        <div class="modal-content">
          <p>Date : ${d.createdAt}</p>
          <p>Grade : ${d.grade}</p>
    
          <button id="close-modal">Fermer</button>
        </div>
      `;
      ouvert=true
      document.body.appendChild(modal);
     }
      // Ajouter un gestionnaire d'événements pour fermer la fenêtre modale lorsque le bouton "Fermer" est cliqué
      const closeModalButton = document.querySelector("#close-modal");
      closeModalButton.addEventListener("click", () => {
        document.body.removeChild(modal);
        ouvert = false
      });
    });
 
}
