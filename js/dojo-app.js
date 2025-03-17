// js/dojo-app.js
const dojoApp = {
  bootstrap: async function() {
    console.log('Dojo app bootstrapped');
    return Promise.resolve();
  },

  mount: async function(props) {
    console.log('Dojo app mounted', props);
    return new Promise((resolve, reject) => {
      try {
        // Use dojoRequire for proper AMD loading
        window.dojoRequire([
          'dojo/parser',
          'dojo/dom',
          'dojo/dom-construct',
          'dojo/on',
          'dojo/_base/declare',
          'dijit/_WidgetBase',
          'dijit/_TemplatedMixin',
          'dijit/form/Button',
          'dijit/form/TextBox',
          'dijit/form/CheckBox',
          'dojo/domReady!'
        ], (parser, dom, domConstruct, on, declare, _WidgetBase, _TemplatedMixin, Button, TextBox, CheckBox) => {
          // Task Manager module using proper Dojo class declaration
          const TaskManager = declare([_WidgetBase, _TemplatedMixin], {
            // Widget template
            templateString: `
              <div class="task-manager">
                <h1>Dojo Task Manager</h1>
                <div class="task-form">
                  <div data-dojo-type="dijit/form/TextBox" 
                       data-dojo-id="taskInput"
                       data-dojo-props="placeHolder:'Enter a task'">
                  </div>
                  <div data-dojo-type="dijit/form/Button"
                       data-dojo-id="addTaskButton"
                       data-dojo-props="label:'Add Task'">
                  </div>
                </div>
                <ul class="task-list"></ul>
              </div>
            `,

            // Widget properties
            taskList: null,

            // Widget lifecycle methods
            postCreate: function() {
              this.inherited(arguments);
              this.setupEvents();
            },

            startup: function() {
              this.inherited(arguments);
              this.taskList = this.domNode.querySelector('.task-list');
            },

            // Event handling
            setupEvents: function() {
              // Use dojo/on for proper event handling
              this.own(
                on(this.addTaskButton, 'click', this.addTask.bind(this))
              );
            },

            // Task management methods
            addTask: function() {
              const taskText = this.taskInput.get('value');
              if (taskText.trim() === '') return;

              // Create task item with proper Dojo widget structure
              const taskItem = domConstruct.create('li', {
                className: 'task-item'
              }, this.taskList);

              // Create checkbox with proper widget lifecycle
              const checkbox = new CheckBox({
                onChange: (checked) => {
                  taskTextNode.style.textDecoration = checked ? 'line-through' : 'none';
                }
              }, domConstruct.create('div', {}, taskItem));
              checkbox.startup();

              // Create text node
              const taskTextNode = domConstruct.create('span', {
                innerHTML: taskText,
                className: 'task-text'
              }, taskItem);

              // Create delete button with proper widget lifecycle
              const deleteBtn = new Button({
                label: 'Delete',
                onClick: () => {
                  // Proper cleanup of widgets and DOM
                  checkbox.destroyRecursive();
                  deleteBtn.destroyRecursive();
                  domConstruct.destroy(taskItem);
                }
              }, domConstruct.create('div', {}, taskItem));
              deleteBtn.startup();

              // Clear input
              this.taskInput.set('value', '');
            }
          });

          // Initialize the TaskManager
          const taskManager = new TaskManager({}, 'app');
          taskManager.startup();
          resolve();
        });
      } catch (e) {
        console.error('Error mounting Dojo app:', e);
        reject(e);
      }
    });
  },

  unmount: async function() {
    console.log('Dojo app unmounted');
    return new Promise((resolve) => {
      // Proper cleanup using widget registry
      if (window.dijit && dijit.registry) {
        dijit.registry.forEach((widget) => {
          if (widget.destroyRecursive) {
            widget.destroyRecursive();
          }
        });
      }
      resolve();
    });
  }
};

export default dojoApp; 