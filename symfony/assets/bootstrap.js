import { startStimulusApp } from '@symfony/stimulus-bundle';

const app = startStimulusApp();
// register any custom, 3rd party controllers here
app.register('product', () => import('./controllers/product_controller.js'));
