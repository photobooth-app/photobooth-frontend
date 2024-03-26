<!-- eslint-disable -->
<template>
  <q-page padding>
    <h1>JSON Forms Vue 3</h1>
    <div>{{ JSON.stringify(this.data) }}</div>
    <div class="myform">
      following form:
      <json-forms :data="data" :renderers="renderers" :schema="schema" @change="onChange" />
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue';

import { useQuasar } from 'quasar';
import { useMainStore } from '../stores/main-store.js';
import { JsonForms } from '@jsonforms/vue';
import { defaultStyles, mergeStyles, quasarRenderers } from '../components/form';

// mergeStyles combines all classes from both styles definitions into one
const myStyles = mergeStyles(defaultStyles, { control: { label: 'q-label' } });

const renderers = [
  ...quasarRenderers,
  // renderersText,
  // here you can add custom renderers
];

const schema = {
  properties: {
    occupation: {
      type: 'string',
    },
    comments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
    vegetarian: {
      type: 'boolean',
    },
    birthDate: {
      type: 'string',
      format: 'date',
    },
    nationality: {
      type: 'string',
      enum: ['DE', 'IT', 'JP', 'US', 'RU', 'Other'],
    },
    personalData: {
      type: 'object',
      properties: {
        age: {
          type: 'integer',
          description: 'Please enter your age.',
        },
        height: {
          type: 'number',
        },
        drivingSkill: {
          type: 'number',
          maximum: 10,
          minimum: 1,
          default: 7,
        },
      },
      required: ['age', 'height'],
    },
    occupation: {
      type: 'string',
    },
    postalCode: {
      type: 'string',
      maxLength: 5,
    },

    name: {
      type: 'string',
      minLength: 1,
      description: "The task's name",
    },
    description: {
      title: 'Long Description',
      type: 'string',
    },
    done: {
      type: 'boolean',
    },
    dueDate: {
      type: 'string',
      format: 'date',
      description: "The task's due date",
    },
    rating: {
      type: 'integer',
      maximum: 5,
    },
    recurrence: {
      type: 'string',
      enum: ['Never', 'Daily', 'Weekly', 'Monthly'],
    },
    recurrenceInterval: {
      type: 'integer',
      description: 'Days until recurrence',
    },
  },
};

const uischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name',
        },
        {
          type: 'Control',
          scope: '#/properties/personalData/properties/age',
        },
        {
          type: 'Control',
          scope: '#/properties/birthDate',
        },
      ],
    },
    {
      type: 'Label',
      text: 'Additional Information',
    },
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/personalData/properties/height',
        },
        {
          type: 'Control',
          scope: '#/properties/nationality',
        },
        {
          type: 'Control',
          scope: '#/properties/occupation',
          suggestion: ['Accountant', 'Engineer', 'Freelancer', 'Journalism', 'Physician', 'Student', 'Teacher', 'Other'],
        },
      ],
    },
  ],
  type: 'HorizontalLayout',
  elements: [
    {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/comments',
          options: {
            showSortButtons: false,
          },
        },
      ],
    },
    {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name',
        },
        {
          type: 'Control',
          scope: '#/properties/description',
          options: {
            multi: true,
          },
        },
        {
          type: 'Control',
          scope: '#/properties/done',
        },
      ],
    },
    {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/dueDate',
        },
        {
          type: 'Control',
          scope: '#/properties/rating',
        },
        {
          type: 'Control',
          scope: '#/properties/recurrence',
        },
        {
          type: 'Control',
          scope: '#/properties/recurrenceInterval',
        },
      ],
    },
  ],
};

export default {
  // name: 'PageName',
  computed: {
    // a computed getter
  },
  components: {
    JsonForms,
  },
  data() {
    return {
      // freeze renderers for performance gains
      renderers: Object.freeze(renderers),
      data: {
        occupation: 'none',
        name: 'Send email to Adrian',
        description: 'Confirm if you have passed the subject\nHereby ...',
        done: true,
        recurrence: 'Daily',
        rating: 3,
      },
      schema,
      uischema,
    };
  },
  methods: {
    onChange(event) {
      console.log(event);
      console.log(event.data);
      this.data = event.data;
    },
  },
  provide() {
    return {
      styles: myStyles,
    };
  },
  setup() {
    const $q = useQuasar();
    const store = useMainStore();

    return {
      store,

      text: ref(''),

      showNotif() {
        $q.notify({
          message: 'Jim pinged you.',
          color: 'purple',
        });
      },
    };
  },
};
</script>
