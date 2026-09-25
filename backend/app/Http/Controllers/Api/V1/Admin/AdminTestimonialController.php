<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Testimonial\StoreTestimonialRequest;
use App\Http\Requests\Testimonial\UpdateTestimonialRequest;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use App\Services\TestimonialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTestimonialController extends BaseApiController
{
    public function __construct(
        protected TestimonialService $testimonialService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Testimonial::class);

        $filters = $request->only(['search', 'is_published', 'is_featured', 'rating', 'sort', 'direction']);
        $perPage = (int) $request->input('per_page', 15);

        $paginator = $this->testimonialService->getPaginated($filters, $perPage);
        $paginator->through(fn ($item) => new TestimonialResource($item));

        return $this->paginated($paginator, 'Témoignages récupérés avec succès.');
    }

    public function store(StoreTestimonialRequest $request): JsonResponse
    {
        $testimonial = $this->testimonialService->create($request->validated());

        return $this->success(
            new TestimonialResource($testimonial),
            'Témoignage créé avec succès.',
            201
        );
    }

    public function show(Testimonial $testimonial): JsonResponse
    {
        $this->authorize('view', $testimonial);

        return $this->success(
            new TestimonialResource($this->testimonialService->findById($testimonial->id)),
            'Témoignage récupéré avec succès.'
        );
    }

    public function update(UpdateTestimonialRequest $request, Testimonial $testimonial): JsonResponse
    {
        $updated = $this->testimonialService->update($testimonial, $request->validated());

        return $this->success(
            new TestimonialResource($updated),
            'Témoignage mis à jour avec succès.'
        );
    }

    public function destroy(Testimonial $testimonial): JsonResponse
    {
        $this->authorize('delete', $testimonial);

        $this->testimonialService->delete($testimonial);

        return $this->success(null, 'Témoignage supprimé avec succès.');
    }
}
