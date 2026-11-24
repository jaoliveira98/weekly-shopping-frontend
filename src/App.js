import { Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './pages/home/home';
import MealForm from './pages/meals/meal-form';
import Meals from './pages/meals/meals';

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/meals" element={<Meals />} />
                <Route path="/meals/new" element={<MealForm />} />
                <Route path="/meals/:id/edit" element={<MealForm />} />
            </Routes>
        </>
    );
}

export default App;
