document.addEventListener("DOMContentLoaded", function() {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.slide');
    const nextButton = document.getElementById('nextButton');
    const makeSelect = document.getElementById('makeSelect');
    const startYearInput = document.getElementById('startYear');
    const endYearInput = document.getElementById('endYear');
    const filterButton = document.getElementById('filterButton');
    const filteredChartDiv = document.getElementById('filteredChart');
    
    const makes = ['BMW', 'Audi', 'Mercedes-Benz', 'Kia', 'Volvo', 'Nissan', 'Hyundai', 'Acura', 'Toyota', 'Porsche', 'Volkswagon', 'Subaru', 'Jeep', 'Infiniti', 'Mazda', 'Honda'].sort();
    
    // Populate make dropdown
    makes.forEach(make => {
        const option = document.createElement('option');
        option.value = make;
        option.text = make;
        makeSelect.appendChild(option);
    });
    
    d3.csv('data/car_sales.csv').then(data => {
        // Log the data to the console for debugging
        console.log("Loaded data:", data);
        
        // Check if the data is being parsed correctly
        if (data.length === 0) {
            console.error("No data loaded. Please check the CSV file.");
            return;
        }

        // Preprocess and filter data
        const filteredData = {
            BMW: calculateAverageSellingPrice(data.filter(d => d.make === 'BMW')),
            Audi: calculateAverageSellingPrice(data.filter(d => d.make === 'Audi')),
            Mercedes: calculateAverageSellingPrice(data.filter(d => d.make === 'Mercedes-Benz')),
            Kia: calculateAverageSellingPrice(data.filter(d => d.make === 'Kia')),
            Volvo: calculateAverageSellingPrice(data.filter(d => d.make === 'Volvo')),
            Nissan: calculateAverageSellingPrice(data.filter(d => d.make === 'Nissan')),
            Hyundai: calculateAverageSellingPrice(data.filter(d => d.make === 'Hyundai')),
            Acura: calculateAverageSellingPrice(data.filter(d => d.make === 'Acura')),
            Toyota: calculateAverageSellingPrice(data.filter(d => d.make === 'Toyota')),
            Porsche: calculateAverageSellingPrice(data.filter(d => d.make === 'Porsche')),
            Volkswagon: calculateAverageSellingPrice(data.filter(d => d.make === 'Volkswagon')),
            Subaru: calculateAverageSellingPrice(data.filter(d => d.make === 'Subaru')),
            Jeep: calculateAverageSellingPrice(data.filter(d => d.make === 'Jeep')),
            Infiniti: calculateAverageSellingPrice(data.filter(d => d.make === 'Infiniti')),
            Mazda: calculateAverageSellingPrice(data.filter(d => d.make === 'Mazda'))
        };

        // Log filtered data to ensure correct filtering
        console.log("Filtered Data for BMW:", filteredData.BMW, "BMW");
        console.log("Filtered Data for Audi:", filteredData.Audi, "Audi");
        console.log("Filtered Data for Mercedes:", filteredData.Mercedes, "Mercedes-Benz");
        
        // Create initial charts
        createLineChart('#slide1', filteredData.BMW, "BMW", annotations='The newer the BMW, the higher the average price.');
        createLineChart('#slide2', filteredData.Audi, "Audi", annotations='The newer the Audi, the higher the average price.');
        createLineChart('#slide3', filteredData.Mercedes, "Mercedes", annotations='The newer the Mercedes, the higher the average price.');
        
        // Add event listener to the "Next" button
        nextButton.addEventListener('click', () => {
            slides[slideIndex].classList.remove('active');
            slideIndex = (slideIndex + 1) % slides.length;
            slides[slideIndex].classList.add('active');
        });
        
        // Add event listener to the filter button
        filterButton.addEventListener('click', () => {
            const selectedMake = makeSelect.value;
            const startYear = +startYearInput.value;
            const endYear = +endYearInput.value;
            const filtered = calculateAverageSellingPrice(data.filter(d => d.make === selectedMake && d.year >= startYear && d.year <= endYear));
            console.log(`Filtered Data for ${selectedMake} from ${startYear} to ${endYear}:`, filtered);
            // createLineChart('#filteredChart', filtered, selectedMake);
            // const filteredData = filterData();
            const filteredChartsContainer = document.getElementById('filteredChart');
            filteredChartsContainer.innerHTML = '';
            createLineChart(filteredChartsContainer, filtered, selectedMake);
        });
    }).catch(error => {
        console.error("Error loading the CSV file:", error);
    });
    
    function calculateAverageSellingPrice(data) {
        const groupedData = d3.groups(data, d => d.year).map(([year, values]) => {
            const avgPrice = d3.mean(values, d => +d.sellingprice);
            return { year: +year, avgPrice: avgPrice };
        });
        return groupedData;
    }

    function createLineChart(container, data, make, annotation = '', clear = false) {
        if (clear) {
            d3.select(container).html('');
        }
        data.sort((a, b) => a.year - b.year);
        const margin = { top: 50, right: 30, bottom: 30, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        const svg = d3.select(container).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -margin.top / 3)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .text(`Average Used Car Sale Price for ${make} by Model Year`);
        
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.year, 0, 1)))
            .range([0, width]);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.avgPrice)])
            .range([height, 0]);
        
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(data.length).tickFormat(d3.timeFormat("%Y")));
        
        svg.append('g')
            .call(d3.axisLeft(y));
        
        const line = d3.line()
            .x(d => x(new Date(d.year, 0, 1)))
            .y(d => y(d.avgPrice));
        
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line)
        
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#f4f4f4")
            .style("padding", "5px 10px")
            .style("border", "1px solid #ddd")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(new Date(d.year, 0, 1)))
            .attr("cy", d => y(d.avgPrice))
            .attr("r", 2)
            .attr("fill", "steelblue")
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Year: ${d.year}<br>Avg Price: $${d.avgPrice.toFixed(2)}<br>Model: ${make}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition().duration(500).style("opacity", 0);
            });
        
        if (annotation) {
            setTimeout(() => {
                const annotations = [{
                    note: {
                        label: annotation,
                        align: 'left',
                        orientation: 'leftTop'
                    },
                    x: x(new Date(2014, 0, 1)),
                    y: y(d3.mean(data.filter(d => d.year === 2014), d => d.avgPrice)),
                    dy: 30,
                    dx: -200,
                    color: 'black',
                    subject: {
                        radius: 5,
                        radiusPadding: 10,
                        width: 10,
                        height: 10,
                        type: 'circle'
                    }
                }];
    
                const makeAnnotations = d3.annotation()
                    .annotations(annotations)
                    .type(d3.annotationLabel);
    
                svg.append('g')
                    .attr('class', 'annotations')
                    .call(makeAnnotations);
            }, 2000);
        }
    }
});