export function addInputElements(inputFieldDiv, inputs) {
  for (const input of inputs) {
    const { id, name, type } = input;

    const labelElement = document.createElement('label');
    labelElement.textContent = name;
    inputFieldDiv.appendChild(labelElement);

    const inputElement = document.createElement('input', {
      id,
    });
    inputElement.placeholder = `${name} Here`;
    inputElement.type = type;
    inputFieldDiv.appendChild(inputElement);
  }
}

export function createDisplayElements(displayDiv, name, inputs) {
  const heading = document.createElement('h2');
  heading.innerHTML = name;
  displayDiv.appendChild(heading);

  const inputFieldDiv = document.createElement('div');

  addInputElements(inputFieldDiv, inputs);

  displayDiv.appendChild(inputFieldDiv);
}
